const panels = new Map(
  ["room", "boxes", "backpack", "plan", "wrapped", "future"].map((name) => [
    name,
    document.querySelector(`#activity-${name}`),
  ]),
);

let soundEnabled = false;

function tinySound(frequency = 520) {
  if (!soundEnabled || !window.AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.035, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.09);
  oscillator.addEventListener("ended", () => context.close());
}

function openActivity(name) {
  panels.forEach((panel, key) => {
    panel.hidden = key !== name;
  });
  const target = panels.get(name);
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.querySelector(".close-panel").focus({ preventScroll: true });
  tinySound(610);
}

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => openActivity(button.dataset.open));
});

document.querySelectorAll(".close-panel").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.closest(".activity-panel");
    panel.hidden = true;
    document.querySelector("#field-stops").scrollIntoView({ behavior: "smooth" });
    tinySound(390);
  });
});

document.querySelector("#surprise-me").addEventListener("click", () => {
  const names = [...panels.keys()];
  openActivity(names[Math.floor(Math.random() * names.length)]);
});

document.querySelector(".sound-toggle").addEventListener("click", (event) => {
  soundEnabled = !soundEnabled;
  event.currentTarget.setAttribute("aria-pressed", String(soundEnabled));
  event.currentTarget.textContent = soundEnabled ? "Sound on" : "Sound off";
  tinySound(720);
});

document.querySelector("#check-clues").addEventListener("click", () => {
  const checked = [...document.querySelectorAll(".clue-list input:checked")].map(
    (input) => input.value,
  );
  const output = document.querySelector("#clue-reflection");

  if (!checked.length) {
    output.textContent = "Choose only clues you can observe. Zero clues is useful information too.";
  } else if (checked.includes("unknown")) {
    output.textContent = "Strong fieldwork: you noticed uncertainty instead of pretending to know.";
  } else if (checked.length === 1) {
    output.textContent = "One clue is a start, not proof. What second clue could strengthen or challenge your idea?";
  } else {
    output.textContent = "You have several clues. Now ask whether a simpler non-AI rule could explain them too.";
  }
  tinySound();
});

const weatherPrediction = {
  sunny: "Outdoor play seems likely.",
  rainy: "Indoor play seems likely.",
  snowy: "Warm clothes seem likely.",
  windy: "A kite seems more likely than usual.",
};

const generatedLines = [
  (a, b) => `A tiny ${a} discovered that the ${b} had been humming all morning.`,
  (a, b) => `“Bring the ${b},” whispered the brave ${a}, “we have a mystery to solve.”`,
  (a, b) => `On Tuesday, the ${a} and the ${b} traded their most surprising questions.`,
];

document.querySelectorAll(".mystery-box").forEach((box) => {
  box.querySelector("button").addEventListener("click", () => {
    const type = box.dataset.box;
    const input = box.querySelector("input").value.trim();
    const output = box.querySelector("output");

    if (!input) {
      output.textContent = "Give me an input first.";
      return;
    }

    if (type === "rule") {
      const number = Number(input);
      output.textContent = Number.isFinite(number)
        ? number % 2 === 0
          ? "Even"
          : "Odd"
        : "This box only accepts numbers.";
    }

    if (type === "predict") {
      output.textContent =
        weatherPrediction[input.toLowerCase()] ??
        "I have too few examples for that weather word, so my prediction is uncertain.";
    }

    if (type === "generate") {
      const words = input.split(/\s+/).filter(Boolean);
      const first = words[0] ?? "cloud";
      const second = words[1] ?? "sandwich";
      const line = generatedLines[(first.length + second.length) % generatedLines.length];
      output.textContent = line(first, second);
    }
    tinySound(560);
  });
});

document.querySelector("#check-boxes").addEventListener("click", () => {
  const selects = [...document.querySelectorAll(".box-guess select")];
  const answered = selects.filter((select) => select.value);
  const correct = selects.filter((select) => select.value === select.dataset.answer);
  const output = document.querySelector("#box-reflection");

  if (answered.length < 3) {
    output.textContent = "Make a best guess for every box. Explanations can change after more tests.";
  } else if (correct.length === 3) {
    output.textContent = "Your explanation fits the evidence: A follows a rule, B predicts from limited examples, and C builds a new response.";
  } else {
    output.textContent = `${correct.length} of 3 explanations fit. Try inputs that reveal repetition, uncertainty, or a fixed rule.`;
  }
  tinySound(correct.length === 3 ? 720 : 430);
});

const cardNotes = {
  common: [
    "Many common examples",
    "This may help with familiar birds, but a backpack crowded with common birds can still overlook unusual ones.",
  ],
  duplicate: [
    "Repeated copies",
    "Duplicates can make one example seem more important than it really is. More files do not always mean more variety.",
  ],
  missing: [
    "Very little evidence",
    "One blurry owl photo may not teach the AI how owls look from different angles, at different ages, or in different light.",
  ],
  private: [
    "Private information",
    "Useful training examples should not expose a child’s home address. Data quality includes respect and permission.",
  ],
  narrow: [
    "A narrow slice of the world",
    "Summer-only photos may make winter birds, seasonal colors, or snowy backgrounds harder to recognize.",
  ],
};

document.querySelectorAll(".data-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".data-card").forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
    const [title, copy] = cardNotes[card.dataset.kind];
    document.querySelector("#data-card-title").textContent = title;
    document.querySelector("#data-card-copy").textContent = copy;
    tinySound(590);
  });
});

document.querySelector("#pack-better").addEventListener("click", () => {
  const count = document.querySelectorAll(".improvement-grid input:checked").length;
  const output = document.querySelector("#backpack-reflection");
  if (count >= 5) {
    output.textContent = "Thoughtful packing. You improved variety, privacy, relevance, and human input—not just the number of examples.";
  } else if (count >= 3) {
    output.textContent = "A strong start. Which missing perspective or privacy risk still deserves attention?";
  } else {
    output.textContent = "Choose at least three improvements. A better backpack usually needs more than one kind of fix.";
  }
  tinySound(count >= 3 ? 680 : 420);
});

const curiosityForm = document.querySelector("#curiosity-form");

curiosityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(curiosityForm);
  const curious = data.get("curious")?.trim();
  const help = data.get("help")?.trim();
  const mine = data.get("mine");
  const summary = document.querySelector("#plan-summary");

  if (!curious || !help || !mine) {
    summary.hidden = false;
    summary.innerHTML = "<strong>Your plan needs three anchors:</strong> your question, the kind of help you want, and one part you will keep yours.";
    return;
  }

  const ownership = {
    idea: "your original idea",
    words: "your own words or artwork",
    decision: "your final decision",
    process: "your problem-solving process",
  };

  summary.hidden = false;
  summary.innerHTML = `
    <p class="eyebrow">Your curiosity plan</p>
    <p><strong>You are exploring:</strong> ${escapeHtml(curious)}</p>
    <p><strong>You want AI to provide:</strong> ${escapeHtml(help)}</p>
    <p><strong>You are keeping ownership of:</strong> ${ownership[mine]}</p>
    <p>Afterward, check what may be wrong or missing—and end with a new question.</p>
  `;
  tinySound(760);
});

document.querySelector("#clear-plan").addEventListener("click", () => {
  curiosityForm.reset();
  const summary = document.querySelector("#plan-summary");
  summary.hidden = true;
  summary.textContent = "";
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

const wrappedForm = document.querySelector("#wrapped-form");

wrappedForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(wrappedForm);
  const topic = data.get("topic");
  const period = data.get("period");
  const scale = data.get("scale");
  const headlineStyle = data.get("headline");
  const values = ["v1", "v2", "v3", "v4"].map((name) => {
    const value = Number(data.get(name));
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  });
  const maximum = Math.max(...values, 1);
  const minimum = Math.min(...values);
  const zoomRange = Math.max(maximum - minimum, 1);
  const highestIndex = values.indexOf(Math.max(...values));
  const bars = document.querySelectorAll("#wrapped-preview .mini-chart span");
  const labels = document.querySelectorAll("#wrapped-preview .mini-chart small");
  const periodLabels = {
    seasons: ["Spring", "Summer", "Fall", "Winter"],
    weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
    projects: ["Project 1", "Project 2", "Project 3", "Project 4"],
    chapters: ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4"],
  };
  const activeLabels = periodLabels[period];
  const highestLabel = activeLabels[highestIndex];

  document.querySelector("#wrapped-preview h3").textContent = topic;
  document.querySelector(".axis-label").textContent = topic;
  document.querySelector(".axis-high").textContent = String(maximum);
  document.querySelector(".axis-mid").textContent = String(Math.round((maximum / 2) * 10) / 10);
  bars.forEach((bar, index) => {
    const zeroHeight = (values[index] / maximum) * 100;
    const zoomHeight = 20 + ((values[index] - minimum) / zoomRange) * 80;
    bar.style.height = `${Math.max(4, scale === "zoom" ? zoomHeight : zeroHeight)}%`;
    labels[index].textContent = activeLabels[index];
  });

  const direction =
    values[3] > values[0]
      ? "ended higher than it began"
      : values[3] < values[0]
        ? "ended lower than it began"
        : "ended where it began";

  document.querySelector(".wrapped-insight").textContent =
    `${highestLabel} has the largest value. Across the four ${period}, the series ${direction}. The chart alone cannot explain why.`;
  document.querySelector("#wrapped-preview .mini-chart").setAttribute(
    "aria-label",
    `A bar chart of ${topic.toLowerCase()} across four ${period}`,
  );

  const headlines = {
    careful: `${topic} ${direction} across four ${period}.`,
    dramatic: `${topic}: a huge transformation!`,
    question: `What might explain the changes in ${topic.toLowerCase()}?`,
  };
  document.querySelector(".wrapped-headline").textContent = headlines[headlineStyle];
  document.querySelector(".wrapped-framing").textContent =
    scale === "zoom"
      ? "This view zooms in, making small differences look larger. Useful for inspection—but easy to overstate."
      : "This view starts at zero, so bar heights stay proportional to the values.";
  document.querySelector('[data-claim="cause"]').textContent =
    `${highestLabel} is highest because I became more motivated.`;
  document.querySelector('[data-claim="fact"]').textContent =
    `${highestLabel} has the highest recorded value.`;
  document.querySelector('[data-claim="future"]').textContent =
    `${topic} will definitely keep rising.`;
  tinySound(720);
});

document.querySelector("#check-wrapped-claim").addEventListener("click", () => {
  const choice = document.querySelector('input[name="wrapped-claim"]:checked');
  const output = document.querySelector("#wrapped-claim-reflection");
  if (!choice) {
    output.textContent = "Choose the claim you think the chart can support by itself.";
  } else if (choice.value === "fact") {
    output.textContent = "Yes. That claim stays close to the recorded values. Causes and future predictions need more evidence.";
  } else {
    output.textContent = "That may become a hypothesis, but the chart alone cannot prove a cause or guarantee what happens next.";
  }
  tinySound(choice?.value === "fact" ? 720 : 430);
});

const experiments = {
  water: {
    skill: "Virtual water pipe",
    title: "A formula predicts water flow.",
    copy: "The formula knows the pipe size and water speed. Then the real pipe becomes partly clogged.",
    answers: [
      ["higher", "Real flow becomes higher than predicted."],
      ["lower", "Real flow becomes lower than predicted."],
      ["same", "Nothing changes."],
    ],
    correct: "lower",
    success: "Yes. The clog adds a real-world condition the simple formula did not include, so measured flow can be lower than predicted.",
    retry: "Try tracing the water through the pipe. Does a clog make it easier or harder for the same amount of water to pass?",
    visual: '<div class="pipe"><span class="water-flow"></span><span class="clog"></span></div>',
    visualClass: "water-visual",
    bridgeTitle: "Engineers compare a model with the machine it represents.",
    bridgeBody: "A digital twin of a pipe, turbine, or factory machine can combine calculations with sensor readings to help teams notice unusual behavior and decide what deserves inspection.",
    bridgeLimit: "If the sensors are late, the assumptions are wrong, or the model omits damage, its prediction can mislead.",
    takeaway: "Models can reduce uncertainty and risk. They do not make the real world perfectly predictable.",
    bridgeVisual: '<div class="bridge-icon">≈</div><p>model ↔ real system</p>',
    depthTitle: "Flow rate combines area and velocity.",
    formula: "Q = A × v<br>A = πd² ÷ 4",
    depthBody: "Q is volumetric flow rate, A is the pipe’s cross-sectional area, v is water velocity, and d is diameter. Because diameter is squared, a change in pipe width can have a large effect on the predicted flow.",
    depthTry: "Try this: if the diameter doubles while velocity stays the same, the idealized area—and therefore predicted flow—becomes four times as large.",
  },
  mesh: {
    skill: "3D mesh",
    title: "Triangles can build a curved-looking object.",
    copy: "A digital teapot is made from many flat triangles. Then half of those triangles are removed.",
    answers: [
      ["smoother", "The teapot looks smoother and more detailed."],
      ["rougher", "The shape looks rougher or develops gaps."],
      ["identical", "The object must look identical."],
    ],
    correct: "rougher",
    success: "Exactly. A mesh represents a surface with connected points and triangles. Fewer pieces can mean less detail or missing areas.",
    retry: "Imagine building a round dome from flat tiles. What happens when many tiles disappear?",
    visual: '<div class="mesh-scene"><span>△</span><span>▽</span><span>△</span><span>▽</span><span>△</span><span>▽</span></div>',
    visualClass: "mesh-visual",
    bridgeTitle: "Digital objects are representations, not the objects themselves.",
    bridgeBody: "Games, medical scans, engineering tools, and augmented reality use 3D meshes to represent shape so people can inspect, design, rehearse, or communicate.",
    bridgeLimit: "A model can hide detail because of low resolution, missing scans, or the viewing angle.",
    takeaway: "Before trusting a digital view, ask how the real object was represented—and what detail disappeared.",
    bridgeVisual: '<div class="bridge-icon">△</div><p>points → surface</p>',
    depthTitle: "A triangle face references three vertices.",
    formula: "vertex = (x, y, z)<br>face = (i, j, k)",
    depthBody: "A mesh stores points in three-dimensional space. Index values i, j, and k identify which three vertices form each triangular face. More faces can capture more detail, but require more storage and computation.",
    depthTry: "Try this: sketch six points, connect them into triangles, then remove one point. Which faces can no longer exist?",
  },
  quantum: {
    skill: "Quantum pair",
    title: "A pair can show a pattern across repeated measurements.",
    copy: "Two qubits are prepared in a simple Bell state and measured in the same way many times.",
    answers: [
      ["match", "The pair tends to produce matching results: 00 or 11."],
      ["fixed", "The pair always produces 00."],
      ["opposite", "The pair must produce opposite results."],
    ],
    correct: "match",
    success: "Yes. An individual result is not fixed in advance, but repeated measurements reveal strong correlation between the pair.",
    retry: "The important clue is correlation: the individual outcome varies, while the two measured results match in this setup.",
    visual: '<div class="quantum-scene"><span>0|1</span><i>↔</i><span>0|1</span></div>',
    visualClass: "quantum-visual",
    bridgeTitle: "Some systems are understood through patterns across many trials.",
    bridgeBody: "Quantum researchers repeat carefully controlled measurements and analyze distributions and correlations rather than treating one run as the whole answer.",
    bridgeLimit: "This tiny demonstration is a conceptual bridge, not a complete explanation of quantum mechanics or entanglement.",
    takeaway: "One result can be uncertain while a repeated pattern is still meaningful.",
    bridgeVisual: '<div class="bridge-icon">00<br>11</div><p>repeat → compare</p>',
    depthTitle: "A Bell state combines two correlated possibilities.",
    formula: "|Φ⁺⟩ = (|00⟩ + |11⟩) ÷ √2",
    depthBody: "The expression describes equal amplitudes for 00 and 11 in this ideal circuit. A Hadamard gate first creates a superposition; a controlled-NOT gate then correlates the second qubit with the first.",
    depthTry: "Try this: make a tally of 20 imagined measurements using only 00 and 11. The counts need not be exactly equal for a small sample.",
  },
  ledger: {
    skill: "Linked ledger",
    title: "Each record points back to the record before it.",
    copy: "Three records are linked in order. Someone secretly changes the middle record without rebuilding what follows.",
    answers: [
      ["notice", "The broken link can reveal that something changed."],
      ["erase", "Every copy automatically disappears."],
      ["truth", "The changed information becomes true."],
    ],
    correct: "notice",
    success: "Right. Linking records can make tampering noticeable because later links no longer match the altered history.",
    retry: "Think of numbered puzzle pieces that must connect. If the middle piece changes, will the next connection still fit?",
    visual: '<div class="ledger-scene"><span>1</span><b>→</b><span class="changed">2</span><b>↛</b><span>3</span></div>',
    visualClass: "ledger-visual",
    bridgeTitle: "Integrity is different from truth.",
    bridgeBody: "Linked records can help groups notice whether a shared history changed. That can support auditing, coordination, and accountability.",
    bridgeLimit: "A tamper-evident record can still contain false, harmful, or badly entered information.",
    takeaway: "Technology can help protect a record’s integrity; people still must judge whether the record is accurate and legitimate.",
    bridgeVisual: '<div class="bridge-icon">1→2→3</div><p>linked history</p>',
    depthTitle: "Each block can include a fingerprint of earlier data.",
    formula: "hashₙ = H(dataₙ + hashₙ₋₁)",
    depthBody: "H represents a hash function that turns input into a fixed-size fingerprint. If earlier data changes, later fingerprints no longer match unless the chain is recomputed and accepted by the network’s rules.",
    depthTry: "Try this: assign each sentence a simple fingerprint such as its character count. Change one sentence and trace which later references become outdated.",
  },
  neuron: {
    skill: "Spiking neuron",
    title: "Signals build until a threshold is crossed.",
    copy: "A simulated neuron receives several small input pulses. Together they push its internal value past a threshold.",
    answers: [
      ["spike", "The neuron produces a spike, then resets."],
      ["store", "The value rises forever without changing."],
      ["ignore", "Inputs can never affect it."],
    ],
    correct: "spike",
    success: "Yes. In this simplified model, inputs accumulate, a threshold triggers a spike, and the state resets.",
    retry: "Picture a cup filling with drops. What happens when the water reaches the marked line?",
    visual: '<div class="neuron-scene"><span class="pulse">•••</span><div class="threshold"><i></i></div><strong>!</strong></div>',
    visualClass: "neuron-visual",
    bridgeTitle: "Brain-inspired computing begins with selective simplification.",
    bridgeBody: "Spiking neural-network research explores computation using events over time, sometimes with specialized hardware designed for efficient, responsive processing.",
    bridgeLimit: "A simulated spiking neuron is not a biological brain, and brain-inspired does not mean brain-equivalent.",
    takeaway: "Useful inspiration still requires honest boundaries around what the model represents.",
    bridgeVisual: '<div class="bridge-icon">•••→!</div><p>signal → threshold</p>',
    depthTitle: "The model tracks how a state changes over time.",
    formula: "dv/dt = (1 − v) ÷ τ<br>spike if v &gt; 0.8",
    depthBody: "v is the simulated neuron’s state and τ controls how quickly it changes. In the original notebook, crossing the threshold produces a spike and resets v to zero.",
    depthTry: "Try this: draw a graph that rises toward 1, resets at 0.8, and begins rising again. Where would each spike appear?",
  },
  flock: {
    skill: "Bird flock",
    title: "Simple rules create flocking behavior.",
    copy: "Each simulated bird moves toward neighbors, avoids collisions, and matches nearby direction. Then a predator appears.",
    answers: [
      ["tighter", "The flock stays exactly the same."],
      ["scatter", "Birds scatter and reorganize."],
      ["freeze", "Every bird freezes."],
    ],
    correct: "scatter",
    success: "That is a strong prediction. A new threat changes the local information each bird responds to, so the group pattern reorganizes.",
    retry: "Think about the rules: if birds steer away from danger, would the original formation remain unchanged?",
    visual: '<div class="flock-scene"><span class="boid" style="left:16%;top:45%">⌁</span><span class="boid" style="left:35%;top:28%">⌁</span><span class="boid" style="left:50%;top:50%">⌁</span><span class="boid" style="left:68%;top:34%">⌁</span><span class="boid" style="left:78%;top:58%">⌁</span><strong style="position:absolute;right:9%;top:15%;font-size:3rem">◆</strong></div>',
    visualClass: "flock-visual",
    bridgeTitle: "Complex group behavior can emerge without one central controller.",
    bridgeBody: "Researchers use local-rule simulations to study crowds, traffic, animal movement, robots, and other systems where many parts influence one another.",
    bridgeLimit: "Real birds and people have goals, memory, environments, and relationships that a few simple rules cannot capture.",
    takeaway: "A surprising group pattern may come from many local interactions—not a single mastermind.",
    bridgeVisual: '<div class="bridge-icon">⌁⌁⌁</div><p>local rules → pattern</p>',
    depthTitle: "Each boid updates position using velocity and nearby forces.",
    formula: "positionₜ₊₁ = positionₜ + velocityₜ",
    depthBody: "Flocking models commonly combine separation, alignment, and cohesion. Each simulated bird reacts to nearby birds, and the repeated local updates create a group pattern.",
    depthTry: "Try this: draw five arrows for velocity. Adjust each arrow slightly toward its neighbors. Repeat twice and watch the pattern change.",
  },
  energy: {
    skill: "Computer energy",
    title: "More computation usually uses more energy.",
    copy: "A program repeats a calculation 1,000 times. Then we change it to repeat 100,000,000 times.",
    answers: [
      ["less", "It will probably use less energy."],
      ["more", "It will probably use more energy."],
      ["zero", "Computers do not use energy for calculations."],
    ],
    correct: "more",
    success: "Right. More work usually takes more time and energy, although hardware, location, and software efficiency also matter.",
    retry: "Imagine doing ten jumping jacks versus ten million. Which takes more work? Computers also need energy to do work.",
    visual: '<div class="energy-meter"><div class="energy-track"><span class="energy-fill"></span></div><p>computation → energy</p></div>',
    visualClass: "energy-visual",
    bridgeTitle: "Digital actions have physical costs.",
    bridgeBody: "Software runs on hardware in data centers and devices that use electricity, cooling, materials, and networks. Engineers can measure workloads and make choices about efficiency.",
    bridgeLimit: "A single estimate is not universal: hardware, energy sources, location, utilization, and measurement methods all change the result.",
    takeaway: "The cloud is made of real machines. Responsible computing includes asking what work is necessary and how efficiently it runs.",
    bridgeVisual: '<div class="bridge-icon">⚡</div><p>computation → resources</p>',
    depthTitle: "Energy depends on power and time.",
    formula: "energy = power × time<br>estimated CO₂e = energy × carbon intensity",
    depthBody: "Power describes the rate of energy use. Carbon-intensity estimates depend on the electricity source and location, so emissions tools produce estimates rather than universal constants.",
    depthTry: "Try this: compare a 100-watt device running for one hour with a 50-watt device running for two hours. Both use 100 watt-hours.",
  },
};

let activeExperiment = "water";

function renderExperiment(name) {
  activeExperiment = name;
  const experiment = experiments[name];
  const stage = document.querySelector("#experiment-stage");
  const visual = stage.querySelector(".experiment-visual");
  const copy = stage.querySelector(".experiment-copy");

  visual.className = `experiment-visual ${experiment.visualClass}`;
  visual.innerHTML = experiment.visual;
  copy.querySelector(".activity-skill").textContent = experiment.skill;
  copy.querySelector("h3").textContent = experiment.title;
  copy.querySelector("h3 + p").textContent = experiment.copy;
  copy.querySelector("fieldset").innerHTML = `
    <legend>What do you predict?</legend>
    ${experiment.answers
      .map(
        ([value, label]) =>
          `<label><input type="radio" name="experiment-answer" value="${value}"> ${label}</label>`,
      )
      .join("")}
  `;
  document.querySelector("#experiment-reflection").textContent = "";

  const bridge = document.querySelector("#experiment-bridge");
  bridge.querySelector(".bridge-visual").innerHTML = experiment.bridgeVisual;
  bridge.querySelector("h3").textContent = experiment.bridgeTitle;
  bridge.querySelector(".bridge-body").textContent = experiment.bridgeBody;
  bridge.querySelector(".bridge-limit").textContent = experiment.bridgeLimit;
  bridge.querySelector(".honest-takeaway").innerHTML =
    `<strong>Takeaway:</strong> ${experiment.takeaway}`;

  const depth = document.querySelector("#technical-depth");
  depth.open = false;
  depth.querySelector(".depth-title").textContent = experiment.depthTitle;
  depth.querySelector(".formula-card").innerHTML = experiment.formula;
  depth.querySelector(".depth-body").textContent = experiment.depthBody;
  depth.querySelector(".depth-try").innerHTML = `<strong>${experiment.depthTry.split(":")[0]}:</strong>${experiment.depthTry.split(":").slice(1).join(":")}`;
}

document.querySelectorAll(".experiment-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".experiment-tab").forEach((item) => {
      item.classList.toggle("active", item === tab);
      item.setAttribute("aria-selected", String(item === tab));
    });
    renderExperiment(tab.dataset.experiment);
    tinySound(580);
  });
});

document.querySelector("#test-experiment").addEventListener("click", () => {
  const choice = document.querySelector('input[name="experiment-answer"]:checked');
  const experiment = experiments[activeExperiment];
  const output = document.querySelector("#experiment-reflection");
  if (!choice) {
    output.textContent = "Make a prediction first. It is okay if your prediction changes after the test.";
  } else {
    output.textContent = choice.value === experiment.correct ? experiment.success : experiment.retry;
  }
  tinySound(choice?.value === experiment.correct ? 720 : 430);
});

renderExperiment("water");

const feedbackForm = document.querySelector("#feedback-form");
const feedbackOutput = document.querySelector("#feedback-output");
const copyFeedbackButton = document.querySelector("#copy-feedback");
let feedbackText = "";

feedbackForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(feedbackForm);
  const role = data.get("role");
  const activity = data.get("activity");
  const worked = data.get("worked")?.trim();
  const improve = data.get("improve")?.trim();
  const next = data.get("next")?.trim();

  const responses = [
    ["Something that helped me think", worked],
    ["Something confusing, missing, or less useful", improve],
    ["One idea for what should happen next", next],
  ].filter(([, value]) => value);

  if (!responses.length) {
    feedbackOutput.innerHTML = "<p>Add at least one observation. A single specific moment is more useful than a perfect review.</p>";
    copyFeedbackButton.disabled = true;
    return;
  }

  feedbackText = [
    `Feedback from ${role}`,
    `Activity: ${activity}`,
    "",
    ...responses.flatMap(([label, value]) => [`${label}:`, value, ""]),
    "Privacy check: I left out names, schools, locations, contact information, and other identifying details.",
  ].join("\n");

  feedbackOutput.innerHTML = `
    <p><strong>Feedback from ${escapeHtml(role)}</strong></p>
    <p><strong>Activity:</strong> ${escapeHtml(activity)}</p>
    ${responses.map(([label, value]) => `<p><strong>${label}:</strong><br>${escapeHtml(value)}</p>`).join("")}
  `;
  copyFeedbackButton.disabled = false;
  tinySound(720);
});

copyFeedbackButton.addEventListener("click", async () => {
  if (!feedbackText) return;
  try {
    await navigator.clipboard.writeText(feedbackText);
    copyFeedbackButton.textContent = "Copied";
  } catch {
    copyFeedbackButton.textContent = "Copy unavailable";
  }
});

document.querySelector("#clear-feedback").addEventListener("click", () => {
  feedbackForm.reset();
  feedbackText = "";
  feedbackOutput.innerHTML = "<p>Complete any prompt that feels useful. Honest uncertainty and “I stopped here” are valuable feedback.</p>";
  copyFeedbackButton.disabled = true;
  copyFeedbackButton.textContent = "Copy feedback";
});
