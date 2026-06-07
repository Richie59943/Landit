const dns = require("dns").promises;
const net = require("net");

const MAX_JOB_PAGE_BYTES = 800000;
const REQUEST_TIMEOUT_MS = 8000;
const FETCH_RETRIES = 1;

class JobParserError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "JobParserError";
    this.statusCode = statusCode;
  }
}

const decodeHtml = (value = "") =>
  String(value)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const stripHtml = (value = "") =>
  decodeHtml(
    String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(?:p|div|li|h[1-6]|section|article)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );

const compact = (value = "") => decodeHtml(value).replace(/\s+/g, " ").trim();

const compactLines = (value = "") =>
  stripHtml(value)
    .split(/\n+/)
    .map((line) => compact(line))
    .filter(Boolean)
    .join("\n");

const getAttr = (tag, attrName) => {
  const escapedName = attrName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escapedName}\\s*=\\s*["']([^"']+)["']`, "i");
  return decodeHtml(tag.match(pattern)?.[1] || "");
};

const getMetaContent = (html, name) => {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  return (
    metaTags
      .map((tag) => {
        const key = getAttr(tag, "name") || getAttr(tag, "property");
        return key?.toLowerCase() === name.toLowerCase()
          ? getAttr(tag, "content")
          : "";
      })
      .find(Boolean) || ""
  );
};

const getTitle = (html) =>
  decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");

const parseJsonSafely = (rawJson) => {
  try {
    return JSON.parse(rawJson.trim());
  } catch (err) {
    try {
      return JSON.parse(rawJson.trim().replace(/,\s*([}\]])/g, "$1"));
    } catch (jsonErr) {
      return null;
    }
  }
};

const getJsonLdBlocks = (html) => {
  const blocks = [];
  const pattern =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = pattern.exec(html);

  while (match) {
    const parsed = parseJsonSafely(match[1]);
    if (parsed) blocks.push(parsed);
    match = pattern.exec(html);
  }

  return blocks.flatMap((block) => {
    if (Array.isArray(block)) return block;
    if (Array.isArray(block?.["@graph"])) return block["@graph"];
    return [block];
  });
};

const getTypeNames = (item) => {
  const type = item?.["@type"] || item?.type;
  if (Array.isArray(type)) return type.map(String);
  return type ? [String(type)] : [];
};

const findJobPosting = (html) =>
  getJsonLdBlocks(html).find((item) =>
    getTypeNames(item).some((type) => type.toLowerCase() === "jobposting")
  );

const getNestedValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) return value.map(getNestedValue).filter(Boolean).join(", ");
  return value.name || value.value || value.url || "";
};

const getLocationText = (jobPosting) => {
  const location = Array.isArray(jobPosting?.jobLocation)
    ? jobPosting.jobLocation[0]
    : jobPosting?.jobLocation;
  const address = location?.address || location;

  if (typeof address === "string") return address;

  return [
    address?.streetAddress,
    address?.addressLocality,
    address?.addressRegion,
    address?.postalCode,
    address?.addressCountry,
  ]
    .filter(Boolean)
    .join(", ");
};

const getSalaryText = (jobPosting, htmlText) => {
  const baseSalary = Array.isArray(jobPosting?.baseSalary)
    ? jobPosting.baseSalary[0]
    : jobPosting?.baseSalary;
  const value = baseSalary?.value || baseSalary;

  if (typeof value === "string") return value;
  if (typeof value?.minValue === "number" || typeof value?.maxValue === "number") {
    const currency = baseSalary?.currency || value?.currency || "USD";
    return [value.minValue, value.maxValue].filter(Boolean).join(" - ") + ` ${currency}`;
  }
  if (typeof value?.value === "number") {
    return `${value.value} ${baseSalary?.currency || value?.currency || "USD"}`;
  }

  return (
    htmlText.match(
      /\$[\d,]+(?:\.\d{2})?(?:\s*(?:-|to|–|—)\s*\$?[\d,]+(?:\.\d{2})?)?(?:\s*(?:per|\/)\s*(?:year|yr|hour|hr|month|mo))?/i
    )?.[0] || ""
  );
};

const parseSalaryRange = (salaryText) => {
  const amounts = String(salaryText)
    .match(/\$?\d[\d,]*(?:\.\d{2})?/g)
    ?.map((amount) => Number(amount.replace(/[$,]/g, "")));

  if (!amounts?.length) return undefined;

  return {
    min: amounts[0],
    max: amounts[1] || amounts[0],
  };
};

const normalizeEmploymentType = (value = "") => {
  const text = String(value).toLowerCase();
  if (text.includes("intern")) return "Internship";
  if (text.includes("part")) return "Part Time";
  if (text.includes("contract") || text.includes("temporary")) return "Contract";
  if (text.includes("full")) return "Full Time";
  return compact(value);
};

const inferEmploymentType = (jobPosting, text) => {
  const structured = getNestedValue(jobPosting?.employmentType);
  if (structured) return normalizeEmploymentType(structured);

  const found = text.match(
    /\b(full[-\s]?time|part[-\s]?time|internship|intern|contract|temporary)\b/i
  )?.[0];
  return found ? normalizeEmploymentType(found) : "";
};

const inferWorkplaceType = (jobPosting, text) => {
  const direct = [
    getNestedValue(jobPosting?.jobLocationType),
    getNestedValue(jobPosting?.applicantLocationRequirements),
  ]
    .filter(Boolean)
    .join(" ");
  const haystack = `${direct} ${text}`.toLowerCase();

  if (haystack.includes("hybrid")) return "Hybrid";
  if (haystack.includes("remote") || haystack.includes("telecommute")) return "Remote";
  if (haystack.includes("on-site") || haystack.includes("onsite")) return "On Site";
  return "";
};

const extractSection = (text, headings) => {
  const headingPattern = headings.map((heading) => heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const nextHeading =
    "preferred qualifications|qualifications|requirements|responsibilities|skills|benefits|about you|what you will do|what you'll do|who you are|nice to have";
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:${headingPattern})\\s*:?\\s*\\n?([\\s\\S]{0,1800}?)(?=\\n\\s*(?:${nextHeading})\\s*:?\\s*\\n|$)`,
    "i"
  );
  return compactLines(text.match(pattern)?.[1] || "");
};

const extractSkills = (jobPosting, text) => {
  const structured = getNestedValue(jobPosting?.skills);
  const section = extractSection(text, ["skills", "technical skills"]);
  const skillsText = structured || section;

  if (!skillsText) return [];

  return skillsText
    .split(/,|;|\n|•|·/)
    .map((skill) => compact(skill.replace(/^[-*]\s*/, "")))
    .filter((skill) => skill.length > 1 && skill.length <= 50)
    .slice(0, 18);
};

const getSourcePlatform = (hostname) => {
  const host = hostname.replace(/^www\./, "").toLowerCase();
  if (host.includes("linkedin.")) return "LinkedIn";
  if (host.includes("indeed.")) return "Indeed";
  if (host.includes("joinhandshake.") || host.includes("handshake.")) return "Handshake";
  if (host.includes("greenhouse.io")) return "Greenhouse";
  if (host.includes("lever.co")) return "Lever";
  if (host.includes("myworkdayjobs.com") || host.includes("workdayjobs.com")) return "Workday";
  if (host.includes("ashbyhq.com")) return "Ashby";
  return host.split(".").slice(-2).join(".");
};

const isPrivateIp = (address) => {
  if (net.isIP(address) === 6) {
    const normalized = address.toLowerCase();
    return (
      normalized === "::1" ||
      normalized === "::" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80")
    );
  }

  if (net.isIP(address) !== 4) return true;

  const [a, b] = address.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
};

const validatePublicUrl = async (urlValue) => {
  let parsedUrl;
  try {
    parsedUrl = new URL(urlValue);
  } catch (err) {
    throw new JobParserError("Enter a valid job posting URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new JobParserError("Only http and https job links are supported.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new JobParserError("This link cannot be parsed.");
  }

  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new JobParserError("This link cannot be parsed.");
  }

  return parsedUrl;
};

const fetchJobHtml = async (url, attempt = 0) => {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LanditJobParser/1.0; +https://landitr.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new JobParserError("Unable to read this job page.");
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      throw new JobParserError("This link is not an HTML job page.");
    }

    return (await response.text()).slice(0, MAX_JOB_PAGE_BYTES);
  } catch (err) {
    if (attempt < FETCH_RETRIES && err.name !== "JobParserError") {
      return fetchJobHtml(url, attempt + 1);
    }

    if (err.name === "TimeoutError" || err.name === "AbortError") {
      throw new JobParserError(
        "Parsing timed out. You can still enter the job details manually."
      );
    }

    throw err;
  }
};

const calculateConfidence = (parsedJob) => {
  const weightedFields = [
    ["position", 25],
    ["company", 20],
    ["description", 20],
    ["location", 10],
    ["salaryText", 8],
    ["employmentType", 7],
    ["workplaceType", 5],
    ["postingDate", 5],
  ];

  return weightedFields.reduce(
    (score, [field, weight]) => (parsedJob[field] ? score + weight : score),
    0
  );
};

const parseJobFromUrl = async (urlValue) => {
  const parsedUrl = await validatePublicUrl(urlValue);
  const html = await fetchJobHtml(parsedUrl.toString());
  const text = stripHtml(html);
  const jobPosting = findJobPosting(html);
  const description =
    stripHtml(jobPosting?.description || "") ||
    getMetaContent(html, "description") ||
    getMetaContent(html, "og:description") ||
    getMetaContent(html, "twitter:description");
  const salaryText = getSalaryText(jobPosting, text);
  const requiredQualifications = extractSection(text, [
    "required qualifications",
    "requirements",
    "minimum qualifications",
    "what you bring",
  ]);
  const preferredQualifications = extractSection(text, [
    "preferred qualifications",
    "nice to have",
    "bonus points",
  ]);
  const companyWebsite =
    getNestedValue(jobPosting?.hiringOrganization?.sameAs) ||
    getNestedValue(jobPosting?.hiringOrganization?.url) ||
    parsedUrl.origin;

  const parsedJob = {
    position:
      compact(jobPosting?.title || "") ||
      getMetaContent(html, "og:title") ||
      getMetaContent(html, "twitter:title") ||
      getTitle(html),
    company:
      compact(jobPosting?.hiringOrganization?.name || "") ||
      getMetaContent(html, "og:site_name"),
    companyWebsite,
    location: getLocationText(jobPosting),
    salaryText,
    salary: parseSalaryRange(salaryText),
    employmentType: inferEmploymentType(jobPosting, text),
    workplaceType: inferWorkplaceType(jobPosting, text),
    description,
    requiredQualifications,
    preferredQualifications,
    skills: extractSkills(jobPosting, text),
    joblink: parsedUrl.toString(),
    applicationUrl: getNestedValue(jobPosting?.url) || parsedUrl.toString(),
    sourcePlatform: getSourcePlatform(parsedUrl.hostname),
    postingDate: compact(jobPosting?.datePosted || ""),
  };

  parsedJob.confidence = calculateConfidence(parsedJob);
  parsedJob.extractionMethod = jobPosting ? "structured_data" : "metadata";

  return parsedJob;
};

module.exports = {
  JobParserError,
  parseJobFromUrl,
};
