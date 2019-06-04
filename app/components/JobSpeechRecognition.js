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
        width: 3.5rem;
        height: 3.5rem;
        margin: 0 12px;
        border-radius: 50%;
        background-color: var(--color-primary);
        overflow: hidden;
      }

      .start-speech {
        display: block;
        width: 100%;
        height: 100%;
        background: url("./images/microphone-lavender.svg") no-repeat center;
        background-size: auto 70%;
      }

      .stop-speech {
        display: none;
        width: 100%;
        height: 100%;
        background-color: indianred;
      }

      :host(speech-recognition[disabled]) {
        opacity: 0.5;
      }

      :host(speech-recognition[listening]) .start-speech {
        display: none;
      }

      :host(speech-recognition[listening]) .stop-speech {
        display: block;
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

  get isDisabled() {
    return this.hasAttribute("disabled");
  }

  get isListening() {
    return this.hasAttribute("listening");
  }

  async connectedCallback() {
    if (!this.isConnected) return;

    try {
      // Check for SpeechRecognition API - currently only webkit
      if (!window.webkitSpeechRecognition) {
        throw new Error("SpeechRecognition API not available on browser");
      }

      await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      if (this.isDisabled) {
        this.removeAttribute("disabled");
      }

      this.recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();

      this.recognition.lang = "en-US";
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.addEventListener("error", this.onSpeechError);
      this.recognition.addEventListener("result", this.onSpeechResult);
      this.recognition.addEventListener("nomatch", this.noSpeechMatch);
    } catch (err) {
      console.warn("SpeechRecognition disabled:", err);
      this.setAttribute("disabled", "");

      const buttons = this.shadowRoot.querySelectorAll("button");

      buttons.forEach(button => button.setAttribute("disabled", ""));
    }
  }

  // disconnectedCallback() {}

  startSpeech() {
    const instance = this.getRootNode().host;

    if (instance.isListening) return;

    instance.recognition.start();
    instance.setAttribute("listening", "");
  }

  stopSpeech() {
    const instance = this.getRootNode().host;

    if (!instance.isListening) return;

    instance.recognition.stop();
    instance.removeAttribute("listening");
  }

  onSpeechResult({ results }) {
    const instance = document.querySelector("speech-recognition");
    const { confidence, transcript } = results[0][0];

    instance.removeAttribute("listening");

    console.info(`${transcript} -- accuracy: ${confidence}`);
    document.querySelector('input[name="job"]').value = transcript;
  }

  noSpeechMatch(e) {
    console.info("noSpeechMatch");
    console.info(e);
  }

  onSpeechError(e) {
    console.warn("onSpeechError");
    console.warn(e);
  }
}

export default JobSpeechRecognition;
