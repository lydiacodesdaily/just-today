/**
 * transitionMessages.ts
 * Generates supportive, encouraging messages for task transitions.
 * Designed to be calm and affirming for neurodivergent users.
 */

/**
 * Generates an encouraging message when a task is completed.
 * Returns both a TTS message and a display message.
 */
export function getTaskCompletionMessage(
  completedTaskName: string,
  nextTaskName: string
): { ttsMessage: string; displayMessage: string } {
  const completionPhrases = [
    `${completedTaskName} is done`,
    `You finished ${completedTaskName}`,
    `${completedTaskName} is complete`,
    `You did it. ${completedTaskName} is finished`,
    `${completedTaskName} is behind you now`,
  ];

  const transitionPhrases = [
    `Time to move on to ${nextTaskName}`,
    `Let's move on to ${nextTaskName}`,
    `Now it's time for ${nextTaskName}`,
    `Ready for ${nextTaskName}`,
    `${nextTaskName} is next`,
  ];

  const completionPhrase =
    completionPhrases[Math.floor(Math.random() * completionPhrases.length)];
  const transitionPhrase =
    transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];

  return {
    ttsMessage: `${completionPhrase}. ${transitionPhrase}.`,
    displayMessage: `${completionPhrase}.\n\n${transitionPhrase}.`,
  };
}

/**
 * Generates an encouraging message for skipping a task.
 */
export function getTaskSkipMessage(
  skippedTaskName: string,
  nextTaskName: string
): { ttsMessage: string; displayMessage: string } {
  const skipPhrases = [
    `It's okay. We're moving past ${skippedTaskName}`,
    `No problem. ${skippedTaskName} can wait`,
    `That's fine. We're skipping ${skippedTaskName}`,
    `${skippedTaskName} is skipped. That's alright`,
  ];

  const transitionPhrases = [
    `Let's focus on ${nextTaskName} instead`,
    `Time for ${nextTaskName}`,
    `Moving on to ${nextTaskName}`,
    `${nextTaskName} is next`,
  ];

  const skipPhrase = skipPhrases[Math.floor(Math.random() * skipPhrases.length)];
  const transitionPhrase =
    transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];

  return {
    ttsMessage: `${skipPhrase}. ${transitionPhrase}.`,
    displayMessage: `${skipPhrase}.\n\n${transitionPhrase}.`,
  };
}

/**
 * Generates a completion message when all tasks are done.
 */
export function getRoutineCompleteMessage(): {
  ttsMessage: string;
  displayMessage: string;
} {
  const completionMessages = [
    {
      tts: 'You did it. Your routine is complete. Well done.',
      display: 'You did it.\n\nYour routine is complete.\n\nWell done.',
    },
    {
      tts: 'All done. You made it through. Great job.',
      display: 'All done.\n\nYou made it through.\n\nGreat job.',
    },
    {
      tts: 'Your routine is finished. You did great today.',
      display: 'Your routine is finished.\n\nYou did great today.',
    },
    {
      tts: "That's everything. You completed your routine. Be proud.",
      display: "That's everything.\n\nYou completed your routine.\n\nBe proud.",
    },
  ];

  const message =
    completionMessages[Math.floor(Math.random() * completionMessages.length)];

  return {
    ttsMessage: message.tts,
    displayMessage: message.display,
  };
}

/**
 * Generates an encouraging message for time milestones during a task.
 * Used to gently notify when a certain amount of time has passed.
 */
export function getTimeMilestoneMessage(
  taskName: string,
  minutesPassed: number
): { ttsMessage: string; displayMessage: string } {
  const milestonePhrases = [
    `${minutesPassed} minutes have passed on ${taskName}`,
    `You've been on ${taskName} for ${minutesPassed} minutes`,
    `${minutesPassed} minutes into ${taskName}`,
    `It's been ${minutesPassed} minutes on ${taskName}`,
  ];

  const encouragementPhrases = [
    "You're doing fine",
    "Keep going at your own pace",
    "You're doing great",
    "No rush, take your time",
    "You've got this",
  ];

  const milestonePhrase =
    milestonePhrases[Math.floor(Math.random() * milestonePhrases.length)];
  const encouragementPhrase =
    encouragementPhrases[Math.floor(Math.random() * encouragementPhrases.length)];

  return {
    ttsMessage: `${milestonePhrase}. ${encouragementPhrase}.`,
    displayMessage: `${milestonePhrase}.\n\n${encouragementPhrase}.`,
  };
}

/**
 * Generates a 1-minute warning message for auto-advancing tasks.
 * Informs the user which task is ending and which is next.
 */
export function getAutoAdvanceWarningMessage(
  currentTaskName: string,
  nextTaskName: string
): { ttsMessage: string; displayMessage: string } {
  const warningPhrases = [
    `1 minute remaining on ${currentTaskName}`,
    `${currentTaskName} has 1 minute left`,
    `1 more minute on ${currentTaskName}`,
  ];

  const transitionPhrases = [
    `We'll move to ${nextTaskName} next`,
    `${nextTaskName} is up next`,
    `Then it's time for ${nextTaskName}`,
  ];

  const warningPhrase =
    warningPhrases[Math.floor(Math.random() * warningPhrases.length)];
  const transitionPhrase =
    transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];

  return {
    ttsMessage: `${warningPhrase}. ${transitionPhrase}.`,
    displayMessage: `${warningPhrase}.\n\n${transitionPhrase}.`,
  };
}
