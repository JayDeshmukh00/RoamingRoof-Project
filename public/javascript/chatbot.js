document.addEventListener('DOMContentLoaded', function() {
    const chatbotWidget = document.getElementById('chatbot-widget');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Toggle chatbot visibility (for floating widget)
    if (chatbotToggle && chatbotContainer) {
        chatbotToggle.addEventListener('click', function() {
            chatbotContainer.style.display = chatbotContainer.style.display === 'flex' ? 'none' : 'flex';
        });

        if (chatbotClose) {
            chatbotClose.addEventListener('click', function() {
                chatbotContainer.style.display = 'none';
            });
        }
    }

    // Drag and drop functionality for floating chatbot widget
    if (chatbotWidget) {
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let widgetStartX = 0;
        let widgetStartY = 0;

        chatbotWidget.addEventListener('mousedown', function(e) {
            // Only start dragging if not clicking on toggle or container
            if (e.target !== chatbotToggle && !chatbotContainer.contains(e.target)) {
                isDragging = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                const rect = chatbotWidget.getBoundingClientRect();
                widgetStartX = rect.left;
                widgetStartY = rect.top;
                chatbotWidget.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const deltaX = e.clientX - dragStartX;
                const deltaY = e.clientY - dragStartY;
                const newLeft = widgetStartX + deltaX;
                const newTop = widgetStartY + deltaY;

                // Constrain to viewport
                const maxLeft = window.innerWidth - chatbotWidget.offsetWidth;
                const maxTop = window.innerHeight - chatbotWidget.offsetHeight;

                chatbotWidget.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
                chatbotWidget.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
                chatbotWidget.style.right = 'auto';
                chatbotWidget.style.bottom = 'auto';
            }
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                chatbotWidget.style.cursor = 'grab';
            }
        });

        // Set initial cursor style
        chatbotWidget.style.cursor = 'grab';
    }

    // Function to add message to chat
    function addMessage(message, isUser = false) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = isUser ? 'user-message-wrapper' : 'bot-message-wrapper';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = message;

        messageWrapper.appendChild(avatarDiv);
        messageWrapper.appendChild(contentDiv);

        chatMessages.appendChild(messageWrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to show typing indicator
    function showTypingIndicator() {
        const typingWrapper = document.createElement('div');
        typingWrapper.className = 'typing-indicator';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-dots';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';

        typingWrapper.appendChild(avatarDiv);
        typingWrapper.appendChild(typingDiv);

        chatMessages.appendChild(typingWrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return typingWrapper;
    }

    // Function to send message
    async function sendMessage() {
        const question = userInput.value.trim();
        if (!question) return;

        // Add user message
        addMessage(question, true);
        userInput.value = '';

        // Show typing indicator
        const typingIndicator = showTypingIndicator();

        try {
            const response = await fetch('/chatbot/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            });

            const data = await response.json();

            // Remove typing indicator
            if (typingIndicator.parentNode) {
                chatMessages.removeChild(typingIndicator);
            }

            if (response.ok) {
                addMessage(data.answer);
            } else {
                addMessage('Sorry, there was an error processing your request.');
            }
        } catch (error) {
            console.error('Error:', error);
            // Remove typing indicator
            if (typingIndicator.parentNode) {
                chatMessages.removeChild(typingIndicator);
            }
            addMessage('Sorry, there was an error connecting to the server.');
        }
    }

    // Event listeners
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Focus input on page load for better UX
        userInput.focus();
    }

    // Only add welcome message if we're on the chatbot page (not the floating widget)
    if (window.location.pathname === '/chatbot') {
        // Welcome message is already in HTML, so we don't need to add another one
        // But we can add a small delay to ensure smooth loading
        setTimeout(() => {
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 100);
    }
});
