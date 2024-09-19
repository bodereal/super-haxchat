console.log('Content script starting to load');

// Define the list of commands
const commands = [
  { pattern: /^gosta$/i, message: "😏 ELE GOOOOSTA!" },
  { pattern: /^ui$/i, message: "😏 UUUUUIIII!" },
  { pattern: /^k{2,5}$/i, message: "🤣 KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK" },
  { pattern: /^la[cç]o$/i, message: "🎀 LAÇO" },
  { pattern: /^genio$/i, message: "🧞 GÊNIO DA BOLA!" },
  { pattern: /^genio @(\w+)$/i, message: "🧞 $1 É UM GÊNIO!" },
  { pattern: /^lenda$/i, message: "🏆 LENDÁRIO!" },
  { pattern: /^lenda @(\w+)$/i, message: "🏆 $1 É UMA LENDA DO FUTEBOL" },
  { pattern: /^bagre$/i, message: "🐟 BAGRE!" },
  { pattern: /^bagres$/i, message: "🐟 É UM AQUÁRIO DE BAGRES" },
  { pattern: /^bagre @(\w+)$/i, message: "🐟 $1 É MUITO BAGRE!" },
  { pattern: /^pick|pickford$/i, message: "🧤 PICKFORD!!!" },
  { pattern: /^cassio$/i, message: "🧤 CÁÁÁSSSIOOOO!!!" },
  { pattern: /^besta @(\w+)$/i, message: "👹 $1 É UMA BESTA ENJAULADA!!!" },
  { pattern: /^cadeira$/i, message: "🪑 VAI TOMAR CADEIRADA!" },
  { pattern: /^sai$/i, message: "💨 SAI DAQUIII!" },
  { pattern: /^bomba$/i, message: "🧨 A BOOOMBA!" },
  { pattern: /^.*$/i, message: "" },
];

function observeAnnouncements(logContents) {
  console.log('Starting to observe announcements');
  const announcementRegex = /^(.*?\:\s)\.(.+)/;
  
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && node.matches('p.announcement')) {
            const match = node.innerHTML.match(announcementRegex);
            if (match) {
              const [, prefix, commandText] = match;
              const trimmedCommand = commandText.trim();
              
              // Check if the command matches any pattern in our list
              for (const command of commands) {
                const patternMatch = trimmedCommand.match(command.pattern);
                if (patternMatch) {
                  let message = command.message;
                  // Replace $1, $2, etc. with captured groups
                  for (let i = 1; i < patternMatch.length; i++) {
                    message = message.replace(`$${i}`, patternMatch[i]);
                  }
                  console.log('Command executed:', trimmedCommand, '- Message:', message);
                  
                  // Replace the content with styled span and the command's message
                  node.innerHTML = `${prefix}<span style="font-weight: bold; font-size: 14px;">${message}</span>`;
                  return; // Exit the loop after first match
                }
              }
              
              // If no command matched
              console.log('Unknown command:', trimmedCommand);
              
              // Keep the original message but style it
              node.innerHTML = `${prefix}<span style="color: red; font-weight: bold; font-size: 14px;">.${trimmedCommand}</span>`;
            }
          }
        });
      }
    });
  });

  observer.observe(logContents, { childList: true, subtree: true });
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

function handleIframe(iframe) {
  const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
  console.log('Waiting for div.log-contents within iframe');
  waitForElement(iframeDocument.body, 'div.log-contents', logContents => {
    console.log('div.log-contents found in iframe');
    observeAnnouncements(logContents);
  });
}

function init() {
  console.log('Waiting for iframe.gameframe');
  waitForElement(document.body, 'iframe.gameframe', iframe => {
    console.log('iframe.gameframe found');
    if (iframe.contentDocument.readyState === 'complete') {
      handleIframe(iframe);
    } else {
      iframe.addEventListener('load', () => handleIframe(iframe));
    }
  });
}

init();

console.log('Content script finished loading');