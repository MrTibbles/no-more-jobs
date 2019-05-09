// Model
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
}

const state = {
  jobs: {},
  jobCount: 0
};

// Actions
/**
 * Add Job
 *
 * @param  {Object}  job
 * @param  {String}  job.description  What needs doing doing
 * @param  {String}  [job.dueDate]    Due date of job
 * @return {Promise}
 */
const addJobAction = job =>
  new Promise(resolve => {
    const newJob = new Job(job);

    state.jobs = {
      ...state.jobs,
      [newJob.id]: newJob
    };
    state.jobCount++;

    resolve();
  });

/**
 * Complete a Job
 *
 * @param  {String}   jobId Target Job ID that has been completed
 * @return {Promise}
 */
const completeJobAction = jobId =>
  new Promise(resolve => {
    state.jobs = {
      ...state.jobs,
      [jobId]: {
        ...state.jobs[jobId],
        completedAt: new Date().toJSON()
      }
    };
    state.jobCount--;

    resolve();
  });

export { addJobAction, completeJobAction, state };
export default state;
