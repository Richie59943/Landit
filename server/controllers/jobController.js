const Job = require("../models/Job");
const dns = require("dns").promises;
const net = require("net");

const MAX_JOB_PAGE_BYTES = 600000;
const REQUEST_TIMEOUT_MS = 8000;

const decodeHtml = (value = "") =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const stripHtml = (value = "") =>
  decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));

const getMetaContent = (html, name) => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escapedName}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  return decodeHtml(html.match(pattern)?.[1] || "");
};

const getTitle = (html) => decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");

const getJsonLdBlocks = (html) => {
  const blocks = [];
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = pattern.exec(html);

  while (match) {
    try {
      blocks.push(JSON.parse(match[1].trim()));
    } catch (err) {
      // Ignore invalid site-provided JSON-LD and fall back to meta parsing.
    }
    match = pattern.exec(html);
  }

  return blocks.flatMap((block) => {
    if (Array.isArray(block)) return block;
    if (Array.isArray(block?.["@graph"])) return block["@graph"];
    return [block];
  });
};

const findJobPosting = (html) =>
  getJsonLdBlocks(html).find((item) => {
    const type = item?.["@type"];
    return Array.isArray(type) ? type.includes("JobPosting") : type === "JobPosting";
  });

const getLocationText = (jobPosting) => {
  const location = Array.isArray(jobPosting?.jobLocation)
    ? jobPosting.jobLocation[0]
    : jobPosting?.jobLocation;
  const address = location?.address || location;

  if (typeof address === "string") return address;

  return [
    address?.addressLocality,
    address?.addressRegion,
    address?.addressCountry,
  ]
    .filter(Boolean)
    .join(", ");
};

const getSalaryText = (jobPosting, htmlText) => {
  const baseSalary = jobPosting?.baseSalary;
  const value = baseSalary?.value || baseSalary;

  if (typeof value === "string") return value;
  if (typeof value?.minValue === "number" || typeof value?.maxValue === "number") {
    const currency = baseSalary?.currency || value?.currency || "USD";
    return [value.minValue, value.maxValue].filter(Boolean).join(" - ") + ` ${currency}`;
  }
  if (typeof value?.value === "number") return `${value.value} ${baseSalary?.currency || "USD"}`;

  return (
    htmlText.match(/\$[\d,]+(?:\s*(?:-|to)\s*\$?[\d,]+)?(?:\s*(?:per|\/)\s*(?:year|yr|hour|hr))?/i)?.[0] || ""
  );
};

const parseSalaryRange = (salaryText) => {
  const amounts = salaryText.match(/\$?\d[\d,]*/g)?.map((amount) =>
    Number(amount.replace(/[$,]/g, ""))
  );

  if (!amounts?.length) return undefined;

  return {
    min: amounts[0],
    max: amounts[1] || amounts[0],
  };
};

const isPrivateIp = (address) => {
  if (net.isIP(address) === 6) {
    return address === "::1" || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80");
  }

  const parts = address.split(".").map(Number);
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
};

const validatePublicUrl = async (urlValue) => {
  const parsedUrl = new URL(urlValue);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only http and https links are supported.");
  }

  const addresses = await dns.lookup(parsedUrl.hostname, { all: true });
  if (addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new Error("This link cannot be parsed.");
  }

  return parsedUrl;
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

// POST /api/jobs (you should already have this)
const addJob = async (req, res) => {
  const { company, position, status, notes, description, location, salary } =
    req.body;
  const joblink = req.body.joblink || req.body.jobLink || "";
  const userId = req.userId;

  const newJob = new Job({
    userId,
    company: company?.trim(),
    position: position?.trim(),
    status,
    notes: notes?.trim(),
    description: description?.trim(),
    location: location?.trim(),
    salary,
    joblink: joblink.trim(),
  });

  try {
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(500).json({ message: "Failed to add job" });
  }
};

const parseJobLink = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: "Job link is required" });
    }

    const parsedUrl = await validatePublicUrl(url);
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LanditJobParser/1.0; +https://landitr.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return res.status(400).json({ message: "Unable to read this job page" });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return res.status(400).json({ message: "This link is not an HTML job page" });
    }

    const html = (await response.text()).slice(0, MAX_JOB_PAGE_BYTES);
    const text = stripHtml(html);
    const jobPosting = findJobPosting(html);
    const title =
      decodeHtml(jobPosting?.title || "") ||
      getMetaContent(html, "og:title") ||
      getTitle(html);
    const company =
      decodeHtml(jobPosting?.hiringOrganization?.name || "") ||
      getMetaContent(html, "og:site_name");
    const description =
      stripHtml(jobPosting?.description || "") ||
      getMetaContent(html, "description") ||
      getMetaContent(html, "og:description");
    const location = getLocationText(jobPosting);
    const salaryText = getSalaryText(jobPosting, text);

    res.json({
      position: title,
      company,
      description,
      location,
      salaryText,
      salary: parseSalaryRange(salaryText),
      joblink: parsedUrl.toString(),
    });
  } catch (err) {
    const message =
      err.name === "TimeoutError"
        ? "Parsing timed out. You can still enter the job details manually."
        : err.message || "Unable to parse job link";
    res.status(400).json({ message });
  }
};

// this is going to allow us to delete a job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!job) return res.status(404).json({ message: " Job Not Found" });
    res.status(200).json({ message: " Job Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete Failed" });
  }
};

///update job status from applied ->interveiw ->ect

const updateJobStatus = async (req, res) => {
  const { status } = req.body; // gets a new status from the requested body

  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // finds the job by user id and user
      { status }, // sets a new status
      { new: true } // returns updated job
    );

    if (!job) {
      return res.status(404).json({ message: "Job Not Found" });
    }

    res.json(job); // send updated job to front end
  } catch (err) {
    res.status(500).json({ message: "update failed" });
  }
};
module.exports = {
  getJobs,
  addJob,
  parseJobLink,
  deleteJob, //  Add delete function
  updateJobStatus, //  Add status update function
};
