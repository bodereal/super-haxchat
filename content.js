console.log("Content script starting to load");

const commands =[
  { pattern: "gosta", message: "😏 ELE GOOOOSTA!" },
  { pattern: "ui", message: "😏 UUUUUIIII!" },
  { pattern: "cavalo", message: "🐴 CAVALO!" },
  { pattern: "k{2,5}", message: "🤣 KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK" },
  { pattern: "u{2,5}", message: "😲 UUUUUUUUUUUUUU!" },
  { pattern: "la[cç]o", message: "🎀 LAÇO" },
  { pattern: "guol", message: "⚽ GUUUUUOOOOOOOOOOOOOOL!" },
  { pattern: "dentro", message: "⚽ TA DENTROOOOOO!" },
  { pattern: "gg", message: "🤝 GG" },
  { pattern: "pace", message: "🦵 PACE" },
  { pattern: "tira", message: "💥 TIIIRA ZAGA!" },
  { pattern: "errou", message: "🚫 ERRROUUUU!" },
  { pattern: "vai", message: "🙅 VAI ERRAR!" },
  { pattern: "efe", message: "💀 F NO CHAT" },
  { pattern: "paz", message: "🏳️ PAZ NOS ESTÁDIOS" },
  { pattern: "toca", message: "🤌 TOCA ESSA BOLA!" },
  { pattern: "tremeu", message: "🥴 TREMEU" },
  { pattern: "digita", message: "⌨️ DIGITA MESMO!" },
  { pattern: "calculado", message: "📐 CALCULADO" },
  { pattern: "impressionante", message: "🫠 IMPRESSIONANTE" },
  { pattern: "skill|tricks", message: "🪄 SKILLS AND TRICKS" },
  { pattern: "genio", message: "🧞 GÊNIO DA BOLA!" },
  { pattern: "lenda", message: "🏆 LENDA!" },
  { pattern: "bagre", message: "🐟 BAGRE!" },
  { pattern: "bagres", message: "🐟 É UM AQUÁRIO DE BAGRES" },
  { pattern: "pick|pickford", message: "🧤 PICKFORD!!!" },
  { pattern: "cassio", message: "🧤 CÁÁÁSSSIOOOO!!!" },
  { pattern: "gk", message: "👺 GK MONSTRO!!!" },
  { pattern: "cadeira", message: "🪑 VAI TOMAR CADEIRADA!" },
  { pattern: "sai", message: "💨 SAI DAQUIII!" },
  { pattern: "some", message: "🏃 SOME DAQUI DESGRAÇA!" },
  { pattern: "bomba", message: "🧨 A BOOOMBA!" },
  { pattern: "cpf", message: "💳 CPF NA NOTA?" },
  { pattern: "ez|facil", message: "😴 TÁ FÁCIL DEMAIS!" },
  { pattern: "oe", message: "🤸 OE!" },
  { pattern: "oe2", message: "🤸 OE DUPLO!" },
  { pattern: "oe3", message: "🤸 OE TRIPLO!" },
  { pattern: "enseba", message: "🤸 ENSEBA!" },
  { pattern: "cera", message: "👂 FAZ CERA!" },
  { pattern: "\@(.+?)\\sbagre", message: "🐟 $1 É MUITO BAGRE!" },
  { pattern: "\@(.+?)\\sbesta", message: "👹 $1 É UMA BESTA ENJAULADA!!!" },
  { pattern: "\@(.+?)\\sdecide", message: "🦶 $1 DECIDE MUITO!!!" },
  { pattern: "\@(.+?)\\slenda", message: "🏆 $1 É UMA LENDA DO FUTEBOL" },
  { pattern: "\@(.+?)\\sgenio", message: "🧞 $1 É UM GÊNIO!" },
  { pattern: "\@(.+?)\\salface", message: "🥬 $1 É MUITO MÃO DE ALFACE" },
].map(command => ({
  ...command,
  pattern: new RegExp(`^\!${command.pattern}$`, 'i')
}));

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function replaceCommand(text) {
  for (const command of commands) {
    const match = text.match(command.pattern);
    if (match) {
      let message = command.message;
      // Replace $1, $2, etc. with captured groups
      for (let i = 1; i < match.length; i++) {
        message = message.replace(`$${i}`, match[i]);
      }
      console.log("Command matched:", text, "->", message);
      return message;
    }
  }

  return text; // Return original text if no command matches
}

function handleInput(input) {
  console.log("Handling input...", input);
  
  const checkCommand = debounce(() => {
    const originalText = input.value.trim();
    const replacedText = replaceCommand(originalText);
    console.log("Potential command:", originalText, replacedText);
    
    if (replacedText !== originalText) {
      input.value = replacedText;
      console.log("Replaced text in input:", input.value);
      
      // Move cursor to end
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, 300); // 300ms debounce time

  input.addEventListener("input", checkCommand);
}

function handleIframe(iframe) {
  const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
  console.log("Waiting for chatbox input within iframe");
  waitForElement(iframeDocument.body, ".chatbox-view .chatbox-view-contents .input input", input => {
    console.log("Chatbox input found in iframe");
    handleInput(input);
  });
}

function waitForElement(parent, selector, callback) {
  const element = parent.querySelector(selector);
  if (element) {
    callback(element);
    return;
  }

  const observer = new MutationObserver((_, obs) => {
    const element = parent.querySelector(selector);
    if (element) {
      obs.disconnect();
      callback(element);
    }
  });

  observer.observe(parent, {
    childList: true,
    subtree: true
  });
}

function init() {
  console.log("Waiting for iframe.gameframe");
  waitForElement(document.body, "iframe.gameframe", iframe => {
    console.log("iframe.gameframe found");
    if (iframe.contentDocument.readyState === "complete") {
      handleIframe(iframe);
    } else {
      iframe.addEventListener("load", () => handleIframe(iframe));
    }
  });
}

init();

console.log("Content script finished loading");