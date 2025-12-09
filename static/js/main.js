// Main Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const essayEditor = document.getElementById('essayEditor');
    const essayTitle = document.getElementById('essayTitle');
    const wordCountDisplay = document.getElementById('wordCount');
    const charCountDisplay = document.getElementById('charCount');
    const paraCountDisplay = document.getElementById('paraCount');
    const readingTimeDisplay = document.getElementById('readingTime');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerText = document.getElementById('timerText');
    const task1Text = document.getElementById('task1Text');
    const task2Text = document.getElementById('task2Text');
    
    // Load saved topic text
    const savedTask1Text = localStorage.getItem('task1Text');
    const savedTask2Text = localStorage.getItem('task2Text');
    
    // Task switching
    const task1Btn = document.getElementById('task1Btn');
    const task2Btn = document.getElementById('task2Btn');
    const task1Content = document.getElementById('task1Content');
    const task2Content = document.getElementById('task2Content');
    
    // File uploads (Task 1 only)
    const task1FileInput = document.getElementById('task1FileInput');
    const task1Upload = document.getElementById('task1Upload');
    const task1Display = document.getElementById('task1Display');
    const task1Image = document.getElementById('task1Image');
    const removeTask1Btn = document.getElementById('removeTask1');
    
    // Buttons
    const timerBtn = document.getElementById('timerBtn');
    const evaluateBtn = document.getElementById('evaluateBtn');
    const evaluateBtnInline = document.getElementById('evaluateBtnInline');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const logoutBtn = document.getElementById('logoutBtn')
    const logoutForm = document.getElementById('logoutForm');
    
    // Modals
    const timerModal = document.getElementById('timerModal');
    const closeTimerModal = document.getElementById('closeTimerModal');
    const startTimerBtn = document.getElementById('startTimer');
    const cancelTimerBtn = document.getElementById('cancelTimer');
    
    // Inline evaluation
    const evalOutput = document.getElementById('evalOutput');
    const evalStatus = document.getElementById('evalStatus');
    
    // Timer variables
    let timerInterval = null;
    let timerSeconds = 0;
    let timerRunning = false;
    let currentTask = 1;
    let evaluating = false;

    const essayPlaceholders = {
        1: 'Start writing your Task 1 essay here...\n\nTip: Use the timer to practice under exam conditions. Aim for about 150 words for Task 1.',
        2: 'Start writing your Task 2 essay here...\n\nTip: Use the timer to practice under exam conditions. Aim for 250+ words for Task 2.'
    };

    const getEssayKey = (task) => `essayContentTask${task}`;
    
    // ============================================
    // Word Count and Statistics
    // ============================================
    
    function updateWordCount() {
        const text = essayEditor.value.trim();
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const wordCount = text === '' ? 0 : words.length;
        const charCount = text.length;
        const charCountNoSpaces = text.replace(/\s/g, '').length;
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (text.trim() ? 1 : 0);
        
        // Reading time calculation (average reading speed: 200 words per minute)
        const readingTime = Math.ceil(wordCount / 200);
        
        wordCountDisplay.textContent = wordCount.toLocaleString();
        charCountDisplay.textContent = charCountNoSpaces.toLocaleString();
        paraCountDisplay.textContent = paragraphs;
        readingTimeDisplay.textContent = readingTime === 0 ? '0 min' : `${readingTime} min`;
        
        // Auto-save to localStorage per task
        localStorage.setItem(getEssayKey(currentTask), text);
    }
    
    // Update word count on input
    essayEditor.addEventListener('input', updateWordCount);
    
    // Initialize essay content for current task
    const initialEssay = localStorage.getItem(getEssayKey(currentTask));
    essayEditor.placeholder = essayPlaceholders[currentTask];
    if (initialEssay) {
        essayEditor.value = initialEssay;
    }
    updateWordCount();
    
    // ============================================
    // Task Switching
    // ============================================
    
    function switchTask(taskNumber) {
        if (taskNumber === currentTask) return;

        // Save current essay before switching
        localStorage.setItem(getEssayKey(currentTask), essayEditor.value);

        if (taskNumber === 1) {
            task1Btn.classList.add('active');
            task2Btn.classList.remove('active');
            task1Content.classList.add('active');
            task2Content.classList.remove('active');
        } else {
            task1Btn.classList.remove('active');
            task2Btn.classList.add('active');
            task1Content.classList.remove('active');
            task2Content.classList.add('active');
        }

        currentTask = taskNumber;

        // Load essay for selected task
        const nextEssay = localStorage.getItem(getEssayKey(currentTask)) || '';
        essayEditor.value = nextEssay;
        essayEditor.placeholder = essayPlaceholders[currentTask];
        if (essayTitle) {
            essayTitle.textContent = `Your Essay — Task ${currentTask}`;
        }
        updateWordCount();
    }
    
    task1Btn.addEventListener('click', () => switchTask(1));
    task2Btn.addEventListener('click', () => switchTask(2));

    // Logout
    if (logoutBtn && logoutForm) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutForm.submit();
        });
    }
    
    // ============================================
    // File Upload Handling (Task 1 only)
    // ============================================
    
    function handleFileUpload(file) {
        if (!file) return;
        
        const reader = new FileReader();
        
        if (file.type.startsWith('image/')) {
            reader.onload = function(e) {
                const imageSrc = e.target.result;
                task1Image.src = imageSrc;
                task1Upload.style.display = 'none';
                task1Display.style.display = 'block';
                localStorage.setItem('task1Image', imageSrc);
            };
            reader.readAsDataURL(file);
        } else {
            // For non-image files, show a message
            alert('File uploaded! Note: PDF and DOC files are accepted but preview is only available for images.');
            task1Upload.style.display = 'none';
            task1Display.style.display = 'block';
            task1Image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjdmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM3MTgwOTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QREYvRE9DIERvY3VtZW50PC90ZXh0Pjwvc3ZnPg==';
            localStorage.setItem('task1Image', 'placeholder');
        }
    }
    
    task1FileInput.addEventListener('change', function(e) {
        handleFileUpload(e.target.files[0]);
    });
    
    // Remove uploaded image
    removeTask1Btn.addEventListener('click', function() {
        task1Upload.style.display = 'block';
        task1Display.style.display = 'none';
        task1FileInput.value = '';
        localStorage.removeItem('task1Image');
    });
    
    // Load saved images from localStorage
    const savedTask1Image = localStorage.getItem('task1Image');
    if (savedTask1Image) {
        task1Image.src = savedTask1Image === 'placeholder'
            ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjdmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM3MTgwOTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QREYvRE9DIERvY3VtZW50PC90ZXh0Pjwvc3ZnPg=='
            : savedTask1Image;
        task1Upload.style.display = 'none';
        task1Display.style.display = 'block';
    }
    
    // ============================================
    // Timer Functionality
    // ============================================
    
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    function updateTimerDisplay() {
        timerText.textContent = formatTime(timerSeconds);
        
        if (timerRunning) {
            timerDisplay.classList.add('running');
        } else {
            timerDisplay.classList.remove('running');
        }
    }
    
    function startTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        timerRunning = true;
        updateTimerDisplay();
        
        timerInterval = setInterval(function() {
            if (timerSeconds > 0) {
                timerSeconds--;
                updateTimerDisplay();
                
                // Play sound when timer reaches 0
                if (timerSeconds === 0) {
                    timerRunning = false;
                    clearInterval(timerInterval);
                    alert('Time is up! Please submit your essay.');
                    // You can add a sound notification here
                }
            } else {
                timerRunning = false;
                clearInterval(timerInterval);
            }
        }, 1000);
    }
    
    function stopTimer() {
        timerRunning = false;
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        updateTimerDisplay();
    }
    
    function resetTimer() {
        stopTimer();
        timerSeconds = 0;
        updateTimerDisplay();
    }
    
    // Timer modal controls
    timerBtn.addEventListener('click', function() {
        if (timerRunning) {
            // If timer is running, stop it
            stopTimer();
        } else {
            // Open timer modal
            timerModal.classList.add('active');
        }
    });
    
    closeTimerModal.addEventListener('click', function() {
        timerModal.classList.remove('active');
    });
    
    cancelTimerBtn.addEventListener('click', function() {
        timerModal.classList.remove('active');
    });
    
    startTimerBtn.addEventListener('click', function() {
        const hours = parseInt(document.getElementById('timerHours').value) || 0;
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
        
        timerSeconds = (hours * 3600) + (minutes * 60) + seconds;
        
        if (timerSeconds > 0) {
            timerModal.classList.remove('active');
            startTimer();
        } else {
            alert('Please set a valid time.');
        }
    });
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const minutes = parseInt(this.getAttribute('data-minutes'));
            document.getElementById('timerHours').value = Math.floor(minutes / 60);
            document.getElementById('timerMinutes').value = minutes % 60;
            document.getElementById('timerSeconds').value = 0;
        });
    });
    
    // Close modal when clicking outside
    timerModal.addEventListener('click', function(e) {
        if (e.target === timerModal) {
            timerModal.classList.remove('active');
        }
    });
    
    // ============================================
    // Inline AI Evaluation
    // ============================================

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    const csrftoken = getCookie('csrftoken');

    async function evaluateEssay() {
        if (evaluating) return;

        const text = essayEditor.value.trim();
        const wordCount = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;

        if (wordCount === 0) {
            evalStatus.textContent = 'Please write an essay before evaluating.';
            return;
        }

        evaluating = true;
        evalStatus.textContent = 'Evaluating...';
        evalOutput.value = '';
        evaluateBtnInline.disabled = true;
        evaluateBtnInline.classList.add('loading');
        topic = task1Text.value
        try {
            const res = await fetch('/api/evaluate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {})
                },
                body: JSON.stringify({
                    essay: text,
                    task_type: currentTask === 1 ? 'task1' : 'task2',
                    topic: currentTask === 1 ? task1Text.value : task2Text.value
                })
            });

            const data = await res.json();

            if (res.ok && data.feedback) {
                evalOutput.value = data.feedback;
                evalStatus.textContent = 'AI feedback received.';
            } else {
                evalStatus.textContent = data.error || 'Unexpected response from server.';
            }
        } catch (err) {
            evalStatus.textContent = `Network error: ${err.message}`;
        } finally {
            evaluating = false;
            evaluateBtnInline.disabled = false;
            evaluateBtnInline.classList.remove('loading');
        }
    }

    evaluateBtnInline.addEventListener('click', evaluateEssay);
    // Keep existing header button wired too
    evaluateBtn.addEventListener('click', evaluateEssay);
    
    // ============================================
    // Clear and Save Functions
    // ============================================
    
    clearBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear your essay? This action cannot be undone.')) {
            essayEditor.value = '';
            updateWordCount();
            localStorage.removeItem(getEssayKey(currentTask));
        }
    });
    
    saveBtn.addEventListener('click', function() {
        const essayContent = essayEditor.value;
        localStorage.setItem(getEssayKey(currentTask), essayContent);
        
        // Create download link
        const blob = new Blob([essayContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ielts-task-${currentTask}-essay-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Visual feedback
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 6L7 15L3 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        saveBtn.style.color = 'var(--success-color)';
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.color = '';
        }, 2000);
    });
    
    // ============================================
    // Keyboard Shortcuts
    // ============================================
    
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveBtn.click();
        }
        
        // Ctrl/Cmd + K to clear (with confirmation)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearBtn.click();
        }
    });
    
    // ============================================
    // Auto-save topic text
    // ============================================
    
    
    if (savedTask1Text) task1Text.value = savedTask1Text;
    if (savedTask2Text) task2Text.value = savedTask2Text;
    
    // Auto-save topic text
    task1Text.addEventListener('input', function() {
        localStorage.setItem('task1Text', this.value);
    });
    
    task2Text.addEventListener('input', function() {
        localStorage.setItem('task2Text', this.value);
    });
    
    // Initialize
    updateWordCount();
    updateTimerDisplay();
});

