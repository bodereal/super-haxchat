console.log("Content script starting to load");

// Define the list of commands
const commands = [
  { pattern: "gosta", message: "😏 ELE GOOOOSTA!" },
  { pattern: "ui", message: "😏 UUUUUIIII!" },
  { pattern: "cavalo", message: "🐴 CAVALO!" },
  { pattern: "k{2,5}", message: "🤣 KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK" },
  { pattern: "la[cç]o", message: "🎀 LAÇO" },
  { pattern: "guol", message: "⚽ GUUUUUOOOOOOOOOOOOOOL!" },
  { pattern: "genio", message: "🧞 GÊNIO DA BOLA!" },
  { pattern: "@(\w+) genio", message: "🧞 $1 É UM GÊNIO!" },
  { pattern: "lenda", message: "🏆 LENDÁRIO!" },
  { pattern: "@(\w+) lenda", message: "🏆 $1 É UMA LENDA DO FUTEBOL" },
  { pattern: "bagre", message: "🐟 BAGRE!" },
  { pattern: "bagres", message: "🐟 É UM AQUÁRIO DE BAGRES" },
  { pattern: "@(\w+) bagre", message: "🐟 $1 É MUITO BAGRE!" },
  { pattern: "pick|pickford", message: "🧤 PICKFORD!!!" },
  { pattern: "cassio", message: "🧤 CÁÁÁSSSIOOOO!!!" },
  { pattern: "gk", message: "👺 GK MONSTRO!!!" },
  { pattern: "@(\w+) besta", message: "👹 $1 É UMA BESTA ENJAULADA!!!" },
  { pattern: "cadeira", message: "🪑 VAI TOMAR CADEIRADA!" },
  { pattern: "sai", message: "💨 SAI DAQUIII!" },
  { pattern: "some", message: "🏃 SOME DAQUI DESGRAÇA!" },
  { pattern: "bomba", message: "🧨 A BOOOMBA!" },
  { pattern: "cpf", message: "💳 CPF NA NOTA?" },
  { pattern: "ez|facil", message: "😴 TÁ FÁCIL DEMAIS!" },
  { pattern: "oe", message: "🤸 OE!" },
  { pattern: "oe2", message: "🤸 OE DUPLO!" },
  { pattern: "oe3", message: "🤸 OE TRIPLO!" },
].map(command => ({ ...command, pattern: new RegExp(`^\!${command.pattern}$`, 'i')}));

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
  
  const handleKeyEvent = (event) => {
    if (event.key === "Tab") {
      event.preventDefault(); // Prevent default tab behavior
      
      const originalText = input.value.trim();
      const replacedText = replaceCommand(originalText);
      console.log("Potential command:", originalText, replacedText);
      
      if (replacedText !== originalText) {
        input.value = replacedText;
        console.log("Replaced text in input:", input.value);
      }
      
      // Refocus the input and move cursor to end
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }, 1);
    }
  };

  input.addEventListener("keydown", handleKeyEvent);
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

  const observer = new MutationObserver((mutations, obs) => {
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