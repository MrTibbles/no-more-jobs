const theme = {
  palette: {
    primary: "aquamarine",
    highlight: "deeppink",
    magnolia: "#f7f7f7",
    dark: "#0d0d0d"
  }
};

/**
 * Web Component Utils
 */
const getRootInstance = (nodePath, componentName) => {
  return nodePath.find(({ nodeName }) => nodeName === componentName);
};

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
      <p>Select due date ⏰</p>
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
      * {
        box-sizing: border-box;
        margin: 0;
        color: ${theme.palette.dark};
      }
      .wrapper {
        min-width: 200px;
        min-height: 50px;
        background-color: ${theme.palette.magnolia};
        position: relative;
      }
      .select-date {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 50px;
      }
      p {
        font-size: 1.125rem;
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
      .wrapper[open] .days {
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

    // Used for styling the wrapper element
    if (attr === "open") {
      if (newValue) return wrapper.setAttribute("open", "");

      wrapper.removeAttribute("open");
    }

    if (attr === "selected-date") {
      wrapper
        .querySelectorAll(".days span")
        .forEach(span => span.removeAttribute("selected"));

      wrapper
        .querySelector(`.days span[data-value="${newValue}"]`)
        .setAttribute("selected", "");

      this.selectedDate = newValue;

      return this.removeAttribute("open");
    }
  }

  // disconnectedCallback() {}

  get open() {
    return this.hasAttribute("open");
  }

  set selectedDate(value) {
    const dateDisplay = this.shadowRoot.querySelector(".select-date p");

    dateDisplay.innerText = value;
  }

  updateOpenState({ path }) {
    const instance = getRootInstance(path, "DATE-PICKER");
    if (instance.open) {
      return instance.removeAttribute("open");
    } else instance.setAttribute("open", true);
  }

  updateSelectedDate({ path, target }) {
    // NOT KEEN ON THIS ROUNDABOUT APPROACH
    const instance = getRootInstance(path, "DATE-PICKER");

    instance.setAttribute("selected-date", target.dataset.value);
  }
}

customElements.define("date-picker", DatePicker);

class JobList extends HTMLElement {
  constructor() {
    super()

    const shadow = this.attachShadow({ mode: "open" });

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "wrapper");

    const jobListings = document.createElement('ul')
    jobListings.setAttribute('class', 'job-list')

    const styles = document.createElement('style')
    styles.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        color: ${theme.palette.dark};
      }
      .wrapper {
        min-width: 200px;
        margin: 0 auto;
      }
      .job-list {
        list-style: none;
        min-height: 12.5rem;
        padding: 0;
      }
      .job-list li {
        padding: 1rem 0.4375rem;
      }
    `

    shadow.appendChild(styles)
    shadow.appendChild(wrapper)
    wrapper.appendChild(jobListings)
  }

  connectedCallback() {
    if (this.isConnected) {
      setTimeout(() => {
        this.renderNewJob()
      }, 2500)
    }
  }

  renderNewJob() {
    const jobList = this.shadowRoot.querySelector('.job-list')
    const tmpl = document.querySelector('#job-item-from-template')
    const newTmplItem = tmpl.content.cloneNode(true)

    const jobValueDisplay = newTmplItem.querySelector('.job-value')
    jobValueDisplay.innerText = 'Foo'

    jobList.appendChild(newTmplItem)
  }
}

customElements.define("job-list", JobList);
