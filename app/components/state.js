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

export { addJobAction, state };
