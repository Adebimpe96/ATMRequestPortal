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
const engineerFormCheckboxes = engineerSection.querySelectorAll("input[type='checkbox']");
const engineerProgressCheckboxes = Array.from(engineerFormCheckboxes).filter(cb => cb.id !== 'completed');
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
        return true;
    }
}

function handleSendMessage() {
    let payload = {};
    let messageToUser = '';

    if (activeTab === "client") {
        if (!validateClientForm()) {
            alert("Please fill in all required fields in the Client Section.");
            return;
        }
        payload = { type: "client_request", data: clientRequest };
        console.log('Client Request Payload prepared:', payload);
        messageToUser = 'Client request submitted successfully!';
    } else if (activeTab === "engineer") {
        if (!validateEngineerForm()) {
            alert("Please check at least one progress field in the Engineer Section.");
            return;
        }
        payload = { type: "engineer_update", data: engineerProgress };
        console.log('Engineer Progress Payload prepared:', payload); // Log engineer data
        messageToUser = 'Engineer progress updated successfully!';
    } else if (activeTab === "chat") {
        const chatMessage = newMessageInput.value.trim();
        if (!chatMessage) {
            alert("Please type a message before sending.");
            return;
        }
        payload = { type: "chat_message", data: { sender: "client", text: chatMessage } };
        console.log('Chat Message Payload prepared:', payload);
        messages.push({ sender: "client", text: chatMessage });
        renderMessages();
        newMessageInput.value = "";
        messageToUser = 'Your message has been sent!';
    } else {
        return;
    }

    if (activeTab === "client") {

        clientRequest = {
            location: "", deploymentType: "", timeline: "", brand: "",
            nettedIp: "", terminalName: "", terminalId: "", ticketId: "",
            notes: ""
        };
        renderClientRequest();
    } else if (activeTab === "engineer") {
        engineerProgress = {
            ipRequestRaised: false, adrouteRequestRaised: false,
            keysGenerated: false, atmOnline: false,
            comments: "", completed: false,
        };
        renderEngineerProgress();
    }
}

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
