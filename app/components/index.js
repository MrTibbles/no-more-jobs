const theme = {
  palette: {
    primary: 'aquamarine',
    highlight: 'deeppink',
    magnolia: '#f7f7f7'
  }
}

class DatePicker extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "wrapper");
    wrapper.innerHTML = `
      ${this.selectedDate
        ? `<p>${this.selectedDate}</p>`
        : `<p class="select-date">Select due date</p>`
      }
      <div class="days">
        <span id="1">1</span>
        <span id="2">2</span>
        <span id="3">3</span>
        <span id="4">4</span>
        <span id="5">5</span>
        <span id="6">6</span>
        <span id="7">7</span>
      </div>
    `

    const styles = document.createElement("style");
    styles.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
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
      .days {
        display: none;
        position: absolute;
        left: 0;
        right: 0;
        bottom: -25px;
        height: 25px;
        background-color: white;
      }
      .days.open {
        display: flex;
      }
      .days span {
        flex-grow: 1;
        padding: 7px 0;
        text-align: center;
        color: ${theme.palette.primary};
      }
      .days span[selected] {
        background-color: ${theme.palette.highlight};
      }
    `;

    shadow.appendChild(styles);
    shadow.appendChild(wrapper);

    this.addEventListener("click", () => this.setOpenState());
  }

  static get observedAttributes() {
    return ["open"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open') {
      const daySelector = this.shadowRoot.querySelector('.days')

      if (newValue) return daySelector.classList.add('open')

      daySelector.classList.remove('open')
    }
  }

  get open() {
    return this.hasAttribute("open");
  }

  setOpenState() {
    if (this.open) {
      return this.removeAttribute("open");
    } else this.setAttribute("open", true);
  }
}

customElements.define("date-picker", DatePicker);
