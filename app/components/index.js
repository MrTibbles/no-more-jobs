const theme = {
  palette: {
    primary: 'aquamarine',
    highlight: 'deeppink',
    magnolia: '#f7f7f7',
    dark: '#0d0d0d'
  }
}

/**
 * Web Component Utils
 */
const getRootInstance = (nodePath, componentName) => {
  return nodePath.find(({ nodeName }) => nodeName === componentName)
}

class DatePicker extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "wrapper");

    const dateDisplay = document.createElement('div')
    dateDisplay.onclick = this.updateOpenState
    dateDisplay.setAttribute('class', 'select-date')
    dateDisplay.innerHTML = `
      <p>Select due date</p>
    `

    const dateOptions = document.createElement('div')
    dateOptions.setAttribute('class', 'days')
    dateOptions.onclick = this.selectDate
    dateOptions.innerHTML = `
      <span id="1">1</span>
      <span id="2">2</span>
      <span id="3">3</span>
      <span id="4">4</span>
      <span id="5">5</span>
      <span id="6">6</span>
      <span id="7">7</span>
    `

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
        padding: 7px 0;
        text-align: center;
        cursor: pointer;
      }
      .days span[selected] {
        background-color: ${theme.palette.highlight};
      }
    `;

    shadow.appendChild(styles);
    shadow.appendChild(wrapper);
    wrapper.appendChild(dateDisplay)
    wrapper.appendChild(dateOptions)
  }

  static get observedAttributes() {
    return ["open", 'selected-date'];
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (attr === 'open') {
      const wrapper = this.shadowRoot.querySelector('.wrapper')

      if (newValue) return wrapper.setAttribute('open', '')

      wrapper.removeAttribute('open')
    }

    if (attr === 'selected-date') {}
  }

  // connectedCallback() {
  //   if (this.isConnected) {}
  // }

  // disconnectedCallback() {}

  get open() {
    return this.hasAttribute("open");
  }

  get selectedDate() {
    return this['selected-date']
  }

  updateOpenState({ path }) {
    const instance = getRootInstance(path, 'DATE-PICKER')
    if (instance.open) {
      return instance.removeAttribute("open");
    } else instance.setAttribute("open", true);
  }

  selectDate({ path, target }) {
    const instance = getRootInstance(path, 'DATE-PICKER')

    // Remove selected prop from siblings
    // instance.querySelectorAll('.days span').map(span =>
    //   span.removeAttribute('selected')
    // )

    instance.setAttribute('selected-date', target.id)
  }

}

customElements.define("date-picker", DatePicker);
