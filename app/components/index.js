import { addJobAction, completeJobAction, state } from "./state";

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
    dateDisplay.innerHTML = `
      <p><span role="img" aria-label="Alarm Clock">⏰</span></p>
    `;

    const dateOptions = document.createElement("div");
    dateOptions.setAttribute("class", "days");
    dateOptions.onclick = this.updateSelectedDate;
    dateOptions.innerHTML = `
      <span data-value="1">1</span>
      <span data-value="2">2</span>
      <span data-value="3">3</span>
      <span data-value="4">4</span>
      <span data-value="5">5</span>
      <span data-value="6">6</span>
      <span data-value="7">7</span>
    `;

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
      .days {
        display: none;
        position: absolute;
        left: 0;
        right: 0;
        bottom: -25px;
        height: 25px;
        background-color: white;
      }
      :host(date-picker[open]) .days {
        display: flex;
      }
      .days span {
        flex-grow: 1;
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

    if (attr === "selected-date") {
      wrapper
        .querySelectorAll(".days span")
        .forEach(span => span.removeAttribute("selected"));

      wrapper
        .querySelector(`.days span[data-value="${newValue}"]`)
        .setAttribute("selected", "");

      const dateDisplay = this.shadowRoot.querySelector(".select-date p");

      dateDisplay.innerText = newValue;

      return this.removeAttribute("open");
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
  }

  static get observedAttributes() {
    return ["job-count"];
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (attr === "job-count" && oldValue < newValue) {
      const newJobId = Object.keys(state.jobs)[newValue - 1];
      const JobItem = customElements.get("job-item");
      const newJob = new JobItem(state.jobs[newJobId]);

      const jobList = this.shadowRoot.querySelector(".job-list");

      jobList.appendChild(newJob);
    }
  }
}

customElements.define("job-list", JobList);

class JobItem extends HTMLElement {
  constructor(newJob) {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const tmpl = document.querySelector("#job-item-from-template");
    const newTmplItem = tmpl.content.cloneNode(true);

    newTmplItem
      .querySelector(".job-item")
      .setAttribute("id", `job-${newJob.id}`);

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

  async updateJobState({ target }) {
    const instance = this.getRootNode().host;

    if (instance.complete) return;

    await completeJobAction(target.parentElement.id).catch(console.warn);
    instance.setAttribute("complete", "");
  }
}

customElements.define("job-item", JobItem);

document.addEventListener("DOMContentLoaded", () => {
  const jobList = document.querySelector("job-list");
  const addJobButton = document.querySelector(".add-job");

  // Feel there is a better approach than this 🤔
  addJobButton.onclick = async () => {
    const description = document.querySelector('input[name="job"]').value;
    const dueDate = document.querySelector("date-picker").selectedDate;

    if (!description) return console.warn("No description added");

    // handle error better
    await addJobAction({ description, dueDate }).catch(console.warn);

    // Update job-list prop to trigger render method on class
    jobList.setAttribute("job-count", state.jobCount);
  };
});
