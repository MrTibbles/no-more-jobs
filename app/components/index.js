class DatePicker extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "wrapper");
    wrapper.innerHTML = "<p>Select due date</p>";

    const styles = document.createElement("style");
    styles.textContent = `
      .wrapper {
        min-width: 200px;
        min-height: 50px;
        background-color: red;
      }
      p {
        color: white;
        margin: 0;
      }
    `;

    shadow.appendChild(styles);
    shadow.appendChild(wrapper);

    this.addEventListener("click", () => this.setOpenState());
  }

  static get observedAttributes() {
    return ["open"];
  }

  get open() {
    return this.hasAttribute("open");
  }

  setOpenState() {
    if (this.open) {
      return this.removeAttribute("open");
    } else this.setAttribute("open", "");
  }
}

customElements.define("date-picker", DatePicker);
