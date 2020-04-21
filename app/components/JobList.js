import { baseStyles } from "./shared.js";

class Job {
  constructor(newJob) {
    if (!newJob.description || typeof newJob.description !== "string") {
      throw new TypeError(
        `description must be a non empty string, received: ${newJob.description}`
      );
    }

    this.id = Date.now();
    this.createdAt = new Date().toJSON();
    this.completedAt = undefined;
    this.description = newJob.description;
    this.dueDate = newJob.dueDate || null;
  }

  set completed(value) {
    this.completedAt = value;
  }
}

class JobList extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const jobListings = document.createElement("ul");
    jobListings.setAttribute("class", "job-list");

    const styles = document.createElement("style");
    styles.textContent = `
      ${baseStyles}
      .job-list {
        min-width: 12.5rem;
        margin: 2rem auto 0;
        list-style: none;
        min-height: 12.5rem;
        padding: 0;
      }
    `;

    shadow.appendChild(styles);
    shadow.appendChild(jobListings);

    // data store
    this.jobLog = new Map();
  }

  static get observedAttributes() {
    return ["job-count"];
  }

  connectedCallback() {
    if (this.isConnected) {
      document.querySelector(".add-job").addEventListener("click", this.addJob);
    }
  }

  disconnectedCallback() {
    document
      .querySelector(".add-job")
      .removeEventListener("click", this.addJob);
  }

  get jobCount() {
    return this.getAttribute("job-count");
  }

  set updateJobCount(value) {
    this.setAttribute("job-count", value);
  }

  get noMoreJobs() {
    return this.getAttribute("job-count") === 0;
  }

  addJob() {
    const description = document.querySelector('input[name="job"]').value;
    const datePicker = document.querySelector("date-picker");

    let dueDate;

    if (datePicker) {
      const selectedDate = document.querySelector("date-picker").selectedDate;
      const today = new Date();
      dueDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        selectedDate
      ).toDateString();
    }

    if (!description) return console.warn("No description added");

    const rootInstance = document.querySelector("job-list");

    const job = new Job({ description, dueDate });
    const JobItem = customElements.get("job-item");
    const newJobItem = new JobItem(job);

    const jobList = rootInstance.shadowRoot.querySelector(".job-list");

    rootInstance.updateJobCount = Number(rootInstance.jobCount + 1);
    jobList.appendChild(newJobItem);

    document.querySelector("#add-job-form").reset();

    rootInstance.jobLog.set(job.id, job);

    newJobItem.addEventListener("job-completed", this.jobCompleted);
  }

  jobCompleted({ detail: { id } }) {
    const rootInstance = this.getRootNode().host;
    const targetJob = rootInstance.jobLog.get(id);

    targetJob.completed = new Date().toJSON();
  }
}

class JobItem extends HTMLElement {
  constructor(newJob) {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const tmpl = document.querySelector("#job-item-from-template");
    const newTmplItem = tmpl.content.cloneNode(true);

    this.setAttribute("id", newJob.id);

    const jobValueDisplay = newTmplItem.querySelector(".job-value");
    const jobDueDateDisplay = newTmplItem.querySelector(".job-due-date");
    const jobState = newTmplItem.querySelector(".job-state");

    jobValueDisplay.innerText = newJob.description;
    if (!newJob.dueDate) {
      jobDueDateDisplay.setAttribute("hide", "");
    } else jobDueDateDisplay.innerText = newJob.dueDate;

    jobState.onclick = this.updateJobState;

    const styles = document.createElement("style");
    styles.textContent = `
      ${baseStyles}
      .job-item {
        padding: 0 0.4375rem;
        height: 4.6875rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: white;
        border-radius: 2px;
        border-width: 0 0 2px;
        border-style: solid;
        border-color: var(--color-primary);
      }
      .job-item:hover {
        border-color: var(--color-highlight);
      }
      .job-details {
        padding-right: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 1;
      }
      .job-details p {
        font-size: 1.75rem;
      }
      .job-due-date {
        padding-left: 2rem;
      }
      .job-due-date[hide] {
        display: none;
      }
      .job-due-date:before {
        content: '⏰';
        padding-right: 0.5rem;
      }
      .job-state {
        display: flex;
        flex: none;
        width: 1.875rem;
        height: 1.875rem;
        justify-content: center;
        align-items: center;
        background-color: var(--color-magnolia);
        border-radius: 2px;
        border: 2px solid var(--color-dark);
        cursor: pointer;
      }
      .job-item svg {
        display: none;
        width: 75%;
        height: 75%;
      }
      :host(job-item[complete]) .job-state, :host(job-item[complete]) svg {
        display: flex;
        cursor: auto;
      }
    `;

    shadow.appendChild(styles);
    shadow.appendChild(newTmplItem);
  }

  get complete() {
    return this.hasAttribute("complete");
  }

  get id() {
    return Number(this.getAttribute("id"));
  }

  async updateJobState() {
    const instance = this.getRootNode().host;

    if (instance.complete) return;

    instance.setAttribute("complete", "");

    const completedEvent = new CustomEvent("job-completed", {
      detail: {
        id: instance.id
      }
    });
    instance.dispatchEvent(completedEvent);
  }
}

export { JobList, JobItem };
