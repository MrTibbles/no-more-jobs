import { baseStyles } from "./shared.js";

class JobSpeechRecognition extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "wrapper");

    const styles = document.createElement("style");
    styles.textContent = `
      ${baseStyles}

      .wrapper {
        display: flex;
      }

      .start-speech {
        display: block;
        width: 50px;
        height: 50px;
        background-color: var(--color-primary);
      }

      .stop-speech {
        display: block;
        width: 50px;
        height: 50px;
        background-color: red;
      }
    `;

    const startSpeechBtn = document.createElement("button");
    startSpeechBtn.setAttribute("class", "start-speech");
    startSpeechBtn.addEventListener("click", this.startSpeech);

    const stopSpeechBtn = document.createElement("button");
    stopSpeechBtn.setAttribute("class", "stop-speech");
    stopSpeechBtn.addEventListener("click", this.stopSpeech);

    shadow.appendChild(styles);
    shadow.appendChild(wrapper);
    wrapper.appendChild(startSpeechBtn);
    wrapper.appendChild(stopSpeechBtn);
  }

  get speechDisabled(){
    return this.getAttribute('disabled') || false
  }

  async connectedCallback() {
    if (!this.isConnected) return

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      if (this.speechDisabled) {
        this.removeAttribute('disabled')
      }

      this.recognition = new (
        window.SpeechRecognition || window.webkitSpeechRecognition
      )();

      this.recognition.lang = "en-US";
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.addEventListener('error', this.onSpeechError);
      this.recognition.addEventListener('result', this.onSpeechResult);
      this.recognition.addEventListener('nomatch', this.noSpeechMatch);

    } catch(err) {
      console.log(err)
      this.setAttribute('disabled', '')
    }
  }

  // disconnectedCallback() {}

  startSpeech() {
    const instance = this.getRootNode().host;
    instance.recognition.start();

    console.log("Started listening");
  }

  stopSpeech() {
    const instance = this.getRootNode().host;
    instance.recognition.stop();

    console.log("Stopped listening");
  }

  onSpeechResult(e) {
    console.info(`onSpeechResult`);
    const result = e.results[0][0]
    
    console.info(result);
  }

  noSpeechMatch(e) {
    console.info("noSpeechMatch");
    console.info(e);
  }

  onSpeechError(e) {
    console.warn('onSpeechError')
    console.warn(e)
  }
}

export default JobSpeechRecognition;
