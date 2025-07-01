// State variables
let activeTab = "client";
let clientRequest = {
    location: "",
    deploymentType: "",
    timeline: "",
    brand: "",
    nettedIp: "",
    terminalName: "",
    terminalId: "",
    ticketId: "",
    notes: "",
};
let engineerProgress = {
    ipRequestRaised: false,
    adrouteRequestRaised: false,
    keysGenerated: false,
    atmOnline: false,
    comments: "",
    completed: false,
};
let messages = [];

// DOM Elements
const tabButtons = document.querySelectorAll(".tab-button");
const clientSection = document.getElementById("client-section");
const engineerSection = document.getElementById("engineer-section");
const chatSection = document.getElementById("chat-section");
const clientFormInputs = clientSection.querySelectorAll("input[type='text'], textarea");
const engineerFormCheckboxes = engineerSection.querySelectorAll("input[type='checkbox']"); // This now includes 'completed'
const engineerProgressCheckboxes = Array.from(engineerFormCheckboxes).filter(cb => cb.id !== 'completed'); // Filter out 'completed'
const engineerComments = document.getElementById("engineerComments");
const newMessageInput = document.getElementById("newMessage");
const messagesDisplay = document.getElementById("messagesDisplay");
const engineerSectionError = document.getElementById("engineer-section-error");


// Functions to update the UI from state
function renderClientRequest() {
    for (const field in clientRequest) {
        const input = document.getElementById(field);
        if (input) {
            input.value = clientRequest[field];
        }
    }
}

function renderEngineerProgress() {
    for (const field in engineerProgress) {
        if (field === "comments") {
            engineerComments.value = engineerProgress[field];
        } else {
            const checkbox = document.getElementById(field);
            if (checkbox) {
                checkbox.checked = engineerProgress[field];
            }
        }
    }
    engineerSectionError.textContent = '';
}

function renderMessages() {
    messagesDisplay.innerHTML = "";
    messages.forEach((msg) => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", msg.sender);
        const bubble = document.createElement("div");
        bubble.classList.add("message-bubble");
        bubble.textContent = msg.text;
        messageDiv.appendChild(bubble);
        messagesDisplay.appendChild(messageDiv);
    });
    // Scroll to bottom
    messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
}

// Event Handlers
function setActiveTab(tabName) {
    activeTab = tabName;

    tabButtons.forEach(button => {
        button.classList.remove("active");
        if (button.dataset.tab === tabName) {
            button.classList.add("active");
        }
    });

    clientSection.style.display = "none";
    engineerSection.style.display = "none";
    chatSection.style.display = "none";

    if (tabName === "client") {
        clientSection.style.display = "grid";
    } else if (tabName === "engineer") {
        engineerSection.style.display = "grid";
    } else if (tabName === "chat") {
        chatSection.style.display = "flex";
    }
}

function handleClientChange(e) {
    const { name, value } = e.target;
    clientRequest = { ...clientRequest, [name]: value };
    const errorElement = document.getElementById(`${name}-error`);
    const formFieldDiv = e.target.closest('.form-field');
    if (errorElement) {
        errorElement.textContent = '';
        if (formFieldDiv) {
            formFieldDiv.classList.remove('error');
        }
    }
}

function handleEngineerChange(e) {
    const { name, checked } = e.target;
    engineerProgress = { ...engineerProgress, [name]: checked };
    engineerSectionError.textContent = '';
}

function handleEngineerCommentsChange(e) {
    engineerProgress = { ...engineerProgress, comments: e.target.value };
}

function validateClientForm() {
    let isValid = true;
    for (const field in clientRequest) {
        const inputElement = document.getElementById(field);
        const errorElement = document.getElementById(`${field}-error`);
        const formFieldDiv = inputElement ? inputElement.closest('.form-field') : null;

        if (inputElement && errorElement) {
            if (clientRequest[field].trim() === "") {
                errorElement.textContent = `${inputElement.previousElementSibling.textContent} is required.`;
                if (formFieldDiv) {
                    formFieldDiv.classList.add('error');
                }
                isValid = false;
            } else {
                errorElement.textContent = '';
                if (formFieldDiv) {
                    formFieldDiv.classList.remove('error');
                }
            }
        }
    }
    return isValid;
}

function validateEngineerForm() {
    let atLeastOneChecked = false;

    for (const checkbox of engineerProgressCheckboxes) {
        if (engineerProgress[checkbox.name]) {
            atLeastOneChecked = true;
            break;
        }
    }

    if (!atLeastOneChecked) {
        engineerSectionError.textContent = "At least one progress field must be checked.";
        return false;
    } else {
        engineerSectionError.textContent = '';
        return true;
    }
}


function handleSendMessage() {
    let messageText = "";
    let sender = "";

    if (activeTab === "client") {
        if (!validateClientForm()) {
            alert("Please fill in all required fields in the Client Section.");
            return;
        }
        messageText = "Client Request:\n";
        for (const field in clientRequest) {
            messageText += `${field.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() + field.replace(/([A-Z])/g, " $1").slice(1)}: ${clientRequest[field]}\n`;
        }
        sender = "client";
        clientRequest = {
            location: "",
            deploymentType: "",
            timeline: "",
            brand: "",
            nettedIp: "",
            terminalName: "",
            terminalId: "",
            ticketId: "",
            notes: "",
        };
        renderClientRequest();
    } else if (activeTab === "engineer") {
        if (!validateEngineerForm()) {
            alert("Please check at least one progress field in the Engineer Section.");
            return;
        }
        messageText = "Engineer Progress Update:\n";
        for (const field in engineerProgress) {
            if (field === "comments") {
                messageText += `Comments: ${engineerProgress[field]}\n`;
            } else {
                messageText += `${field.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() + field.replace(/([A-Z])/g, " $1").slice(1)}: ${engineerProgress[field] ? 'Yes' : 'No'}\n`;
            }
        }
        sender = "engineer";
         engineerProgress = {
            ipRequestRaised: false,
            adrouteRequestRaised: false,
            keysGenerated: false,
            atmOnline: false,
            comments: "",
            completed: false,
        };
        renderEngineerProgress();
    } else if (activeTab === "chat") {
        messageText = newMessageInput.value.trim();
        sender = "client";
        if (!messageText) {
            alert("Please type a message before sending.");
            return;
        }
        newMessageInput.value = "";
    }

    if (messageText) {
        messages.push({ sender: sender, text: messageText });
        renderMessages();
        alert('Thank you! Message sent.');
    }
}

// Attach event listeners
tabButtons.forEach(button => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

clientFormInputs.forEach(input => {
    input.addEventListener("input", handleClientChange);
});

engineerFormCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", handleEngineerChange);
});

engineerComments.addEventListener("input", handleEngineerCommentsChange);

newMessageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSendMessage();
    }
});

// Initial render
renderClientRequest();
renderEngineerProgress();
renderMessages();
setActiveTab("client");
