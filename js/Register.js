      // ============================================
// SUPABASE INIT - FIXED
// ============================================

let supabaseClient = null;

function initSupabase() {
    // Check if Supabase CDN is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase CDN not loaded!');
        console.error('Add this to register.html <head>:');
        console.error('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return null;
    }
    
    // Initialize client
    try {
        const { createClient } = window.supabase;
        return createClient(
            'https://ijertpdemtmojjrwtpvg.supabase.co',  // ← Your Supabase URL
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZXJ0cGRlbXRtb2pqcnd0cHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODE2NzMsImV4cCI6MjA5Nzg1NzY3M30.xNDz_Hv7yxxjujZjUOo7Ocf2s9rmBtIDo3ewCzyL-VA'                      // ← Your anon key
        );
    } catch (e) {
        console.error('❌ Supabase init error:', e);
        return null;
    }
}

// Initialize on script load
supabaseClient = initSupabase();
      
      
      
      // Mobile Menu Toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Tab Switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        const formCards = document.querySelectorAll('.form-card');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active form card
                formCards.forEach(card => card.classList.remove('active'));
                document.getElementById(targetTab + 'Form').classList.add('active');
                
                // Scroll to top of form
                window.scrollTo({
                    top: document.querySelector('.registration-container').offsetTop - 100,
                    behavior: 'smooth'
                });
            });
        });

        // File Upload
        const fileUpload = document.getElementById('fileUpload');
        const fileInput = document.getElementById('fileInput');
        const filePreview = document.getElementById('filePreview');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const fileRemove = document.getElementById('fileRemove');

        fileUpload.addEventListener('click', () => fileInput.click());

        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });

        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });

        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFileSelect(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });

        function handleFileSelect(file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            
            if (!allowedTypes.includes(file.type)) {
                showToast('error', 'Invalid File Type', 'Please upload a PDF, DOC, or DOCX file');
                fileInput.value = '';
                return;
            }

            if (file.size > maxSize) {
                showToast('error', 'File Too Large', 'Maximum file size is 10MB');
                fileInput.value = '';
                return;
            }

            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            filePreview.classList.add('active');
            fileUpload.style.display = 'none';
        }

        fileRemove.addEventListener('click', () => {
            fileInput.value = '';
            filePreview.classList.remove('active');
            fileUpload.style.display = 'block';
        });

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }

        // Co-authors Management
        let coAuthorCount = 0;
        const addCoAuthorBtn = document.getElementById('addCoAuthorBtn');
        const coAuthorsList = document.getElementById('coAuthorsList');

        addCoAuthorBtn.addEventListener('click', () => {
            coAuthorCount++;
            const coAuthorHTML = `
                <div class="co-author-item" id="coAuthor${coAuthorCount}">
                    <button type="button" class="co-author-remove" onclick="removeCoAuthor(${coAuthorCount})">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Name</label>
                            <input type="text" class="form-input" name="coAuthor${coAuthorCount}Name" placeholder="Full name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" name="coAuthor${coAuthorCount}Email" placeholder="email@example.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">University</label>
                            <input type="text" class="form-input" name="coAuthor${coAuthorCount}University" placeholder="University name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Country</label>
                            <input type="text" class="form-input" name="coAuthor${coAuthorCount}Country" placeholder="Country">
                        </div>
                    </div>
                </div>
            `;
            coAuthorsList.insertAdjacentHTML('beforeend', coAuthorHTML);
        });

        function removeCoAuthor(id) {
            const coAuthor = document.getElementById(`coAuthor${id}`);
            if (coAuthor) {
                coAuthor.remove();
            }
        }

// ============================================
// ATTENDEE REGISTRATION WITH SUPABASE
// ============================================

const attendeeForm = document.getElementById('attendeeRegistrationForm');

attendeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

        // ✅ SAFETY: Check if Supabase is ready
    if (!supabaseClient) {
        showToast('error', 'Connection Error', 'Database not connected. Please try again later.');
        return;
    }
    
    // Validate form
    if (!validateForm(attendeeForm)) {
        showToast('error', 'Validation Error', 'Please fill in all required fields correctly');
        return;
    }

    const submitBtn = attendeeForm.querySelector('.submit-btn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Collect form data
        const formData = new FormData(attendeeForm);
        const attendeeData = {
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            whatsapp: formData.get('whatsapp') || null,
            nationality: formData.get('nationality'),
            university: formData.get('university'),
            faculty: formData.get('faculty'),
            academic_year: formData.get('academicYear'),
            student_id: formData.get('studentId') || null,
            hear_about: formData.get('hearAbout') || null,
            dietary_restrictions: formData.get('dietary') || null,
            newsletter: formData.get('newsletter') === 'on',
            terms_accepted: formData.get('terms') === 'on',
            registration_ip: await getClientIP(),
            user_agent: navigator.userAgent
        };

        // Insert into Supabase
        const { data, error } = await supabaseClient
            .from('attendees')
            .insert([attendeeData])
            .select();

        if (error) throw error;

        // Success!
        console.log('Registration successful:', data);
        
        // Send confirmation email (you'll need to set up Supabase Edge Function for this)
        // await sendConfirmationEmail(attendeeData.email, attendeeData.first_name);

        showToast('success', 'Registration Successful!', 'Check your email for confirmation details');
        attendeeForm.reset();
        
        // Redirect to thank you page (optional)
        // setTimeout(() => {
        //     window.location.href = 'thank-you.html';
        // }, 2000);

    } catch (error) {
        console.error('Registration error:', error);
        
        // Check for duplicate email
        if (error.code === '23505') {
            showToast('error', 'Email Already Registered', 'This email is already registered. Please use a different email.');
        } else {
            showToast('error', 'Registration Failed', 'Please try again or contact support.');
        }
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// ============================================
// ABSTRACT SUBMISSION WITH SUPABASE
// ============================================

const abstractForm = document.getElementById('abstractSubmissionForm');

abstractForm.addEventListener('submit', async (e) => {
    e.preventDefault();

        // ✅ SAFETY: Check if Supabase is ready
    if (!supabaseClient) {
        showToast('error', 'Connection Error', 'Database not connected. Please try again later.');
        return;
    }
    
    // Validate form
    if (!validateForm(abstractForm)) {
        showToast('error', 'Validation Error', 'Please fill in all required fields correctly');
        return;
    }

    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        showToast('error', 'File Required', 'Please upload your abstract document');
        return;
    }

    const submitBtn = abstractForm.querySelector('.submit-btn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Step 1: Upload file to Supabase Storage
        const file = fileInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('abstracts')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Get file URL
        const { data: { publicUrl } } = supabaseClient.storage
            .from('abstracts')
            .getPublicUrl(fileName);

        // Step 2: Collect abstract data
        const formData = new FormData(abstractForm);
        
        // Collect co-authors
        const coAuthors = [];
        let coAuthorCount = 1;
        while (document.querySelector(`[name="coAuthor${coAuthorCount}Name"]`)) {
            coAuthors.push({
                name: document.querySelector(`[name="coAuthor${coAuthorCount}Name"]`).value,
                email: document.querySelector(`[name="coAuthor${coAuthorCount}Email"]`).value,
                university: document.querySelector(`[name="coAuthor${coAuthorCount}University"]`).value,
                country: document.querySelector(`[name="coAuthor${coAuthorCount}Country"]`).value
            });
            coAuthorCount++;
        }

        const abstractData = {
            title: formData.get('title'),
            track: formData.get('track'),
            study_type: formData.get('studyType'),
            presentation_type: formData.get('presentationType'),
            keywords: formData.get('keywords'),
            background: formData.get('background'),
            methods: formData.get('methods'),
            results: formData.get('results'),
            conclusion: formData.get('conclusion'),
            corresponding_name: formData.get('correspondingName'),
            corresponding_email: formData.get('correspondingEmail'),
            corresponding_phone: formData.get('correspondingPhone'),
            corresponding_university: formData.get('correspondingUniversity'),
            co_authors: coAuthors,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            ethics_approval: formData.get('ethicsApproval'),
            ethics_number: formData.get('ethicsNumber') || null,
            conflict_of_interest: formData.get('conflictOfInterest'),
            terms_accepted: formData.get('abstractTerms') === 'on',
            submission_ip: await getClientIP(),
            user_agent: navigator.userAgent
        };

        // Step 3: Insert into Supabase
        const { data, error } = await supabaseClient
            .from('abstracts')
            .insert([abstractData])
            .select();

        if (error) throw error;

        // Success!
        console.log('Abstract submitted:', data);

        showToast('success', 'Abstract Submitted!', 'You will receive a confirmation email shortly');
        abstractForm.reset();
        document.getElementById('filePreview').classList.remove('active');
        document.getElementById('fileUpload').style.display = 'block';
        document.getElementById('coAuthorsList').innerHTML = '';
        coAuthorCount = 0;

    } catch (error) {
        console.error('Abstract submission error:', error);
        showToast('error', 'Submission Failed', 'Please try again or contact support.');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});



// ============================================
// HELPER FUNCTIONS
// ============================================

// Get Client IP (for tracking)
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

// Form Validation
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        const formGroup = field.closest('.form-group');
        
        if (field.type === 'checkbox' && !field.checked) {
            isValid = false;
            if (formGroup) formGroup.classList.add('error');
        } else if (field.type !== 'checkbox' && !field.value.trim()) {
            isValid = false;
            if (formGroup) formGroup.classList.add('error');
        } else if (field.type === 'email' && !isValidEmail(field.value)) {
            isValid = false;
            if (formGroup) formGroup.classList.add('error');
        } else {
            if (formGroup) formGroup.classList.remove('error');
        }
    });

    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Remove error on input
document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
    input.addEventListener('input', () => {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
        }
    });
});

// Toast Notification
function showToast(type, title, message) {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon i');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');

    toast.className = `toast ${type}`;
    toastIcon.className = type === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle';
    toastTitle.textContent = title;
    toastMessage.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

document.getElementById('toastClose').addEventListener('click', () => {
    document.getElementById('toast').classList.remove('show');
});

console.log('📝 Registration System Connected to Supabase!');




        function validateForm(form) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                const formGroup = field.closest('.form-group');
                
                if (field.type === 'checkbox' && !field.checked) {
                    isValid = false;
                    if (formGroup) formGroup.classList.add('error');
                } else if (field.type !== 'checkbox' && !field.value.trim()) {
                    isValid = false;
                    if (formGroup) formGroup.classList.add('error');
                } else if (field.type === 'email' && !isValidEmail(field.value)) {
                    isValid = false;
                    if (formGroup) formGroup.classList.add('error');
                } else {
                    if (formGroup) formGroup.classList.remove('error');
                }
            });

            return isValid;
        }

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        // Remove error on input
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
            input.addEventListener('input', () => {
                const formGroup = input.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.remove('error');
                }
            });
        });

        // Toast Notification
        function showToast(type, title, message) {
            const toast = document.getElementById('toast');
            const toastIcon = toast.querySelector('.toast-icon i');
            const toastTitle = toast.querySelector('.toast-title');
            const toastMessage = toast.querySelector('.toast-message');

            toast.className = `toast ${type}`;
            toastIcon.className = type === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle';
            toastTitle.textContent = title;
            toastMessage.textContent = message;

            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
            }, 5000);
        }

        document.getElementById('toastClose').addEventListener('click', () => {
            document.getElementById('toast').classList.remove('show');
        });

        console.log('TSMRC 2026 - Registration Page Loaded Successfully!');
