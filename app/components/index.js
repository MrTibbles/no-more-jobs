import DatePicker from "./DatePicker.js";
import { JobList, JobItem } from "./JobList.js";
import JobSpeechRecognition from "./JobSpeechRecognition.js";

customElements.define("date-picker", DatePicker);
customElements.define("job-list", JobList);
customElements.define("job-item", JobItem);
customElements.define("speech-recognition", JobSpeechRecognition);
