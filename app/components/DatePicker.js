import { baseStyles } from "./shared";

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
        background-color: var(--color-highlight);
      }
      .days span[selected] {
        background-color: var(--color-primary);
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

export default DatePicker;
