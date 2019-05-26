class Job {
  constructor(newJob) {
    if (!newJob.description || typeof newJob.description !== "string") {
      throw new TypeError(
        `description must be a non empty string, received: ${
          newJob.description
        }`
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

const theme = {
  palette: {
    primary: "lavender",
    highlight: "deeppink",
    magnolia: "#f7f7f7",
    dark: "#0d0d0d"
  }
};

const baseStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    color: ${theme.palette.dark};
  }
  button {
    background: none;
    border: none;
    outline: none;
    padding: 0;
  }
`;

class DatePicker extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "wrapper");

    const dateDisplay = document.createElement("div");
    dateDisplay.onclick = this.updateOpenState;
    dateDisplay.setAttribute("class", "select-date");
    dateDisplay.innerHTML = `<p></p>`;

    const dateOptions = document.createElement("div");
    dateOptions.setAttribute("class", "days");
    dateOptions.onclick = this.updateSelectedDate;

    const today = new Date();
    const numberOfDays = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();

    let days = ``;
    for (var i = 0; i < numberOfDays; i++) {
      days += `<span data-value="${i + 1}">${i + 1}</span>`;
    }

    dateOptions.innerHTML = days;

    const styles = document.createElement("style");
    styles.textContent = `
      ${baseStyles}
      .wrapper {
        height: 3.5rem;
        position: relative;
        padding: 0 2rem;
      }
      .select-date {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 3.5rem;
      }
      p {
        font-size: 1.75rem;
      }
      p:before {
        content: '⏰';
        display: inline-block;
        padding-right: 0.5rem;
      }
      .days {
        display: none;
        position: absolute;
        left: -10px;
        right: -10px;
        bottom: -100px;
        height: 100px;
        background-color: white;
        box-shadow: 0 10px 20px 2px #666;
        flex-wrap: wrap;
      }
      :host(date-picker[open]) .days {
        display: flex;
      }
      .days span {
        width: 14.285%;
        padding: 0.4375rem 0;
        text-align: center;
        cursor: pointer;
      }
      .days span:hover {
        background-color: ${theme.palette.highlight};
      }
      .days span[selected] {
        background-color: ${theme.palette.primary};
      }
    `;

    shadow.appendChild(styles);
    shadow.appendChild(wrapper);
    wrapper.appendChild(dateDisplay);
    wrapper.appendChild(dateOptions);
  }

  static get observedAttributes() {
    return ["open", "selected-date"];
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    const wrapper = this.shadowRoot.querySelector(".wrapper");

    if (attr === "selected-date" && oldValue !== newValue) {
      const dateDisplay = this.shadowRoot.querySelector(".select-date p");

      wrapper
        .querySelectorAll(".days span")
        .forEach(span => span.removeAttribute("selected"));

      if (newValue === null) {
        dateDisplay.innerText = "";
      } else {
        wrapper
          .querySelector(`.days span[data-value="${newValue}"]`)
          .setAttribute("selected", "");

        const today = new Date();
        dateDisplay.innerText = new Date(
          today.getFullYear(),
          today.getMonth(),
          newValue
        ).toLocaleDateString();
      }

      this.removeAttribute("open");
    }
  }

  connectedCallback() {
    if (this.isConnected) {
      document.querySelector("#add-job-form").onreset = () => this.reset(this);
    }
  }

  get open() {
    return this.hasAttribute("open");
  }

  get selectedDate() {
    // change to formatted date
    return this.getAttribute("selected-date");
  }

  updateOpenState() {
    const instance = this.getRootNode().host;
    if (instance.open) {
      return instance.removeAttribute("open");
    } else instance.setAttribute("open", true);
  }

  updateSelectedDate({ target }) {
    const instance = this.getRootNode().host;

    instance.setAttribute("selected-date", target.dataset.value);
  }

  reset(rootInstance) {
    rootInstance.removeAttribute("selected-date");
  }
}

customElements.define("date-picker", DatePicker);

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
    const selectedDate = document.querySelector("date-picker").selectedDate;
    const today = new Date();
    const dueDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      selectedDate
    ).toDateString();

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

customElements.define("job-list", JobList);

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
        border-color: ${theme.palette.primary};
      }
      .job-item:hover {
        border-color: ${theme.palette.highlight};
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
        background-color: ${theme.palette.magnolia};
        border-radius: 2px;
        border: 2px solid ${theme.palette.dark};
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

customElements.define("job-item", JobItem);
