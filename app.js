(function () {
  const SEED = [
    {
      id: "cafe-nunoa",
      day: "Jueves",
      time: "20:30",
      what: "Café",
      minutes: 45,
      barrio: "Ñuñoa",
      name: "Mateo",
      age: 29,
      line: "Si llueve nos quedamos. Si no, caminamos hasta la plaza.",
      reply: "Llego en bici. Si hay mesa afuera, esa.",
    },
    {
      id: "feria-italia",
      day: "Sábado",
      time: "11:00",
      what: "Feria",
      minutes: 60,
      barrio: "Italia",
      name: "Luna",
      age: 26,
      line: "Miramos libros y comemos algo de pie. Sin apuro de después.",
      reply: "Empiezo por el puesto de discos. Te reconozco por el abrigo.",
    },
    {
      id: "mesa-lastarria",
      day: "Viernes",
      time: "19:00",
      what: "Una mesa",
      minutes: 40,
      barrio: "Lastarria",
      name: "Diego",
      age: 31,
      line: "Una sola pregunta: qué estás haciendo que te da un poco de miedo.",
      reply: "Pido la mesa a mi nombre. Son cuarenta minutos y nos vamos.",
    },
  ];

  const STORE = "quedamos.v1";
  const app = document.getElementById("app");
  const tabSemana = document.getElementById("tab-semana");
  const tabProponer = document.getElementById("tab-proponer");

  let state = load();
  let view = "semana";
  let openId = null;

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE) || "{}");
      return {
        mine: Array.isArray(parsed.mine) ? parsed.mine : [],
        joined: parsed.joined && typeof parsed.joined === "object" ? parsed.joined : {},
      };
    } catch (error) {
      return { mine: [], joined: {} };
    }
  }

  function save() {
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  function all() {
    return state.mine.concat(SEED);
  }

  function find(id) {
    return all().find((item) => item.id === id) || null;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function setView(next) {
    view = next;
    openId = null;
    tabSemana.classList.toggle("on", next === "semana");
    tabProponer.classList.toggle("on", next === "proponer");
    render();
  }

  function render() {
    app.replaceChildren();
    if (view === "proponer") renderForm();
    else if (openId) renderDetail(find(openId));
    else renderList();
  }

  function renderList() {
    const list = el("div", "list");
    all().forEach((date) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "date-card";
      button.append(el("p", "when", `${date.day} · ${date.time}`));
      button.append(el("h2", "", date.what));
      button.append(el("p", "who", `${date.name}, ${date.age} · ${date.barrio} · ${date.minutes} min`));
      button.addEventListener("click", () => {
        openId = date.id;
        render();
      });
      list.append(button);
    });
    app.append(list);
  }

  function renderDetail(date) {
    if (!date) {
      openId = null;
      renderList();
      return;
    }
    const root = el("article", "detail");
    const back = document.createElement("button");
    back.type = "button";
    back.className = "back";
    back.textContent = "Volver";
    back.addEventListener("click", () => {
      openId = null;
      render();
    });
    root.append(back);
    root.append(el("p", "when", `${date.day} · ${date.time}`));
    root.append(el("h2", "", date.what));
    root.append(el("p", "phrase", date.line));
    const facts = el("ul", "facts");
    [date.barrio, `${date.minutes} minutos`, `${date.name}, ${date.age}`].forEach((fact) => {
      facts.append(el("li", "", fact));
    });
    root.append(facts);

    const joined = state.joined[date.id];
    if (!joined) {
      const actions = el("div", "actions");
      const go = document.createElement("button");
      go.type = "button";
      go.className = "primary";
      go.textContent = "Quiero ir";
      go.addEventListener("click", () => {
        state.joined[date.id] = [date.reply];
        save();
        render();
      });
      actions.append(go);
      root.append(actions);
      root.append(el("p", "note", "El chat se abre ahora. La cita sigue siendo en un lugar público."));
    } else {
      const thread = el("div", "thread");
      joined.forEach((text, index) => {
        thread.append(el("p", index === 0 ? "bubble" : "bubble mine", text));
      });
      const form = document.createElement("form");
      form.className = "composer";
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 180;
      input.required = true;
      input.placeholder = "Escribí algo corto";
      input.setAttribute("aria-label", "Mensaje");
      const send = document.createElement("button");
      send.type = "submit";
      send.className = "primary";
      send.textContent = "Enviar";
      form.append(input, send);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        state.joined[date.id].push(text);
        save();
        render();
      });
      thread.append(form);
      root.append(thread);
    }
    app.append(root);
  }

  function field(labelText, control) {
    const label = document.createElement("label");
    label.append(document.createTextNode(labelText), control);
    return label;
  }

  function renderForm() {
    const form = document.createElement("form");
    const name = document.createElement("input");
    name.required = true;
    name.maxLength = 40;
    name.autocomplete = "given-name";
    const age = document.createElement("input");
    age.type = "number";
    age.required = true;
    age.min = "18";
    age.max = "99";
    const what = document.createElement("input");
    what.required = true;
    what.maxLength = 48;
    what.placeholder = "Café, feria, una mesa";
    const barrio = document.createElement("input");
    barrio.required = true;
    barrio.maxLength = 40;
    const day = document.createElement("select");
    ["Jueves", "Viernes", "Sábado", "Domingo"].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      day.append(option);
    });
    const time = document.createElement("input");
    time.type = "time";
    time.required = true;
    time.value = "20:00";
    const minutes = document.createElement("select");
    [40, 45, 60].forEach((value) => {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = `${value} min`;
      minutes.append(option);
    });
    const line = document.createElement("textarea");
    line.required = true;
    line.maxLength = 160;
    line.rows = 3;
    const people = el("div", "grid");
    people.append(field("Tu nombre", name), field("Edad", age));
    const when = el("div", "grid");
    when.append(field("Día", day), field("Hora", time));
    form.append(
      people,
      field("Qué van a hacer", what),
      field("Barrio", barrio),
      when,
      field("Duración", minutes),
      field("Una frase", line),
      el("p", "note", "La cita queda publicada en esta semana. El otro lado la acepta o no.")
    );
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "primary";
    submit.textContent = "Publicar la cita";
    form.append(submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const years = Number(age.value);
      if (years < 18) return;
      const date = {
        id: `mia-${Date.now()}`,
        day: day.value,
        time: time.value,
        what: what.value.trim(),
        minutes: Number(minutes.value),
        barrio: barrio.value.trim(),
        name: name.value.trim(),
        age: years,
        line: line.value.trim(),
        reply: "Ahí voy a estar. Si me atraso cinco minutos, te escribo.",
      };
      state.mine.unshift(date);
      save();
      openId = date.id;
      view = "semana";
      tabSemana.classList.add("on");
      tabProponer.classList.remove("on");
      render();
    });
    app.append(form);
  }

  tabSemana.addEventListener("click", () => setView("semana"));
  tabProponer.addEventListener("click", () => setView("proponer"));
  render();
})();
