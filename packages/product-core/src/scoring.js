export function scoreTraitTest(test, answersByQuestionId) {
  validateTestShape(test);

  if (test.scoring?.type === 'axis-letter-majority') {
    return scoreAxisLetterMajority(test, answersByQuestionId);
  }

  const totals = Object.fromEntries(test.axes.map((axis) => [axis.id, 0]));
  const answered = [];

  for (const question of test.questions) {
    const selectedCode = answersByQuestionId[question.id];
    const selected = question.options.find((option) => option.code === selectedCode);
    if (!selected) {
      throw new Error(`Missing or invalid answer for question: ${question.id}`);
    }

    for (const [axisId, delta] of Object.entries(selected.scores ?? {})) {
      if (!(axisId in totals)) {
        throw new Error(`Unknown axis in option score: ${axisId}`);
      }
      totals[axisId] += delta;
    }

    answered.push({
      questionId: question.id,
      selectedCode,
    });
  }

  return {
    testId: test.id,
    version: test.version,
    answered,
    totals,
    result: chooseClosestResult(test.results, totals),
  };
}

function scoreAxisLetterMajority(test, answersByQuestionId) {
  const totals = Object.fromEntries(test.axes.map((axis) => [axis.id, 0]));
  const axisBreakdown = Object.fromEntries(
    test.axes.map((axis) => [
      axis.id,
      Object.fromEntries(axis.letters.map((letter) => [letter, 0])),
    ]),
  );
  const answered = [];

  for (const question of test.questions) {
    const selectedCode = answersByQuestionId[question.id];
    const selected = question.options.find((option) => option.code === selectedCode);
    if (!selected) {
      throw new Error(`Missing or invalid answer for question: ${question.id}`);
    }
    if (!question.axis || !(question.axis in axisBreakdown)) {
      throw new Error(`Unknown question axis: ${question.axis}`);
    }
    if (!(selected.code in axisBreakdown[question.axis])) {
      throw new Error(`Unknown axis letter in answer: ${selected.code}`);
    }

    axisBreakdown[question.axis][selected.code] += 1;
    for (const [axisId, delta] of Object.entries(selected.scores ?? {})) {
      if (!(axisId in totals)) {
        throw new Error(`Unknown axis in option score: ${axisId}`);
      }
      totals[axisId] += delta;
    }
    answered.push({
      questionId: question.id,
      selectedCode,
    });
  }

  const resultCode = test.axes.map((axis) => resolveAxisLetter(axis, axisBreakdown, answersByQuestionId)).join('');
  const result = test.results.find((candidate) => candidate.code === resultCode);
  if (!result) {
    throw new Error(`No result profile for code: ${resultCode}`);
  }

  return {
    testId: test.id,
    version: test.version,
    answered,
    totals,
    axisBreakdown,
    result,
  };
}

function resolveAxisLetter(axis, axisBreakdown, answersByQuestionId) {
  const [leftLetter, rightLetter] = axis.letters;
  const leftScore = axisBreakdown[axis.id][leftLetter];
  const rightScore = axisBreakdown[axis.id][rightLetter];

  if (leftScore > rightScore) {
    return leftLetter;
  }
  if (rightScore > leftScore) {
    return rightLetter;
  }

  return answersByQuestionId[axis.tieBreakerQuestionId] === rightLetter ? rightLetter : leftLetter;
}

function chooseClosestResult(results, totals) {
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('At least one result is required');
  }

  return results
    .map((result) => ({
      result,
      distance: vectorDistance(result.vector ?? {}, totals),
    }))
    .sort((left, right) => {
      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }
      return left.result.code.localeCompare(right.result.code);
    })[0].result;
}

function vectorDistance(resultVector, totals) {
  return Object.entries(totals).reduce((sum, [axisId, value]) => {
    const target = Number(resultVector[axisId] ?? 0);
    return sum + (value - target) ** 2;
  }, 0);
}

function validateTestShape(test) {
  if (!test || typeof test !== 'object') {
    throw new Error('Test must be an object');
  }
  if (!test.id || !Number.isInteger(test.version)) {
    throw new Error('Test id and integer version are required');
  }
  if (!Array.isArray(test.axes) || test.axes.length === 0) {
    throw new Error('At least one axis is required');
  }
  if (!Array.isArray(test.questions) || test.questions.length === 0) {
    throw new Error('At least one question is required');
  }
}
