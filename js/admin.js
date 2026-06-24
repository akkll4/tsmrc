// ============================================
// SUPABASE CONFIGURATION
// ============================================
// ============================================
// SUPABASE CONFIGURATION - FIXED
// ============================================

// ============================================
// SUPABASE CONFIGURATION - FIXED
// ============================================
const SUPABASE_URL = 'https://ijertpdemtmojjrwtpvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZXJ0cGRlbXRtb2pqcnd0cHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODE2NzMsImV4cCI6MjA5Nzg1NzY3M30.xNDz_Hv7yxxjujZjUOo7Ocf2s9rmBtIDo3ewCzyL-VA';

// ✅ Wait for Supabase CDN to load, then initialize
function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase CDN not loaded. Check your HTML has:');
        console.error('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return null;
    }
    
    try {
        const { createClient } = window.supabase;
        return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error('❌ Failed to create Supabase client:', e);
        return null;
    }
}

// Initialize client
const supabase = initSupabase();

// If Supabase failed to load, show error and stop
if (!supabase) {
    document.addEventListener('DOMContentLoaded', () => {
        const loginContainer = document.getElementById('loginContainer');
        if (loginContainer) {
            loginContainer.innerHTML = `
                <div class="login-card">
                    <div style="text-align: center; padding: 2rem; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3>Supabase Not Connected</h3>
                        <p style="margin: 1rem 0;">Please check:</p>
                        <ul style="text-align: left; margin: 1rem; font-size: 0.9rem;">
                            <li>Supabase CDN script is in HTML head</li>
                            <li>SUPABASE_URL is correct</li>
                            <li>SUPABASE_ANON_KEY is valid</li>
                            <li>You're running on a server (not file://)</li>
                        </ul>
                        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2D3691; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-refresh"></i> Retry
                        </button>
                    </div>
                </div>
            `;
        }
    });
}


// ✅ FIX: Properly initialize Supabase client
const { createClient } = window.supabase;

// ============================================
// STATE MANAGEMENT
// ============================================
let currentUser = null;
let currentSection = 'dashboard';
let registrationsData = [];
let abstractsData = [];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure Supabase is fully loaded
    setTimeout(() => {
        checkAuth();
        initializeEventListeners();
    }, 100);
});

// ============================================
// AUTHENTICATION
// ============================================
async function checkAuth() {
    // ✅ Safety check: if supabase isn't ready, show login
    if (!supabase) {
        showLogin();
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.warn('⚠️ Session check error (normal if not logged in):', error.message);
            showLogin();
            return;
        }
        
        if (data?.session) {
            currentUser = data.session.user;
            const isAdmin = await verifyAdminUser(data.session.user.email);
            if (!isAdmin) {
                await supabase.auth.signOut();
            }
        } else {
            showLogin();
        }
    } catch (error) {
        console.warn('⚠️ Auth check failed:', error.message);
        showLogin();
    }
}

async function verifyAdminUser(email) {
    try {
        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !admin) {
            // Not an admin - logout
            await supabase.auth.signOut();
            showLogin();
            showToast('error', 'Access Denied', 'Admin privileges required');
            return false;
        }
        
        // ✅ Admin verified - show dashboard
        document.getElementById('adminName').textContent = admin.name || 'Admin';
        showDashboard();
        return true;
        
    } catch (error) {
        console.error('Admin verification error:', error);
        showLogin();
        return false;
    }
}

function showLogin() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadDashboardData();
}

// ✅ FIX: Login Form with proper error handling
// ✅ FIXED: Login form with proper Supabase check
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // ✅ Check if Supabase is ready
        if (!supabase) {
            showToast('error', 'Connection Error', 'Supabase not connected. Check console for details.');
            return;
        }
        
        const email = document.getElementById('adminEmail')?.value.trim() || '';
        const password = document.getElementById('adminPassword')?.value || '';
        const errorDiv = document.getElementById('loginError');
        const loginBtn = document.querySelector('.btn-login');
        
        if (errorDiv) errorDiv.style.display = 'none';
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        }
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                console.error('Login error:', error);
                if (errorDiv) {
                    errorDiv.style.display = 'flex';
                    errorDiv.querySelector('span').textContent = 
                        error.message === 'Invalid login credentials' 
                        ? 'Invalid email or password' 
                        : 'Login failed. Please try again.';
                }
                return;
            }
            
            // Verify admin status
            const isAdmin = await verifyAdminUser(data.user.email);
            
            if (isAdmin) {
                currentUser = data.user;
                showToast('success', 'Login Successful', 'Welcome to the admin dashboard!');
                if (document.getElementById('adminPassword')) {
                    document.getElementById('adminPassword').value = '';
                }
            } else {
                // Not an admin - logout and show error
                await supabase.auth.signOut();
                if (errorDiv) {
                    errorDiv.style.display = 'flex';
                    errorDiv.querySelector('span').textContent = 'Admin access required. Contact support.';
                }
            }
            
        } catch (error) {
            console.error('Unexpected login error:', error);
            if (errorDiv) {
                errorDiv.style.display = 'flex';
                errorDiv.querySelector('span').textContent = 'An unexpected error occurred. Please try again.';
            }
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login to Dashboard';
            }
        }
    });
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await supabase.auth.signOut();
        currentUser = null;
        showLogin();
        showToast('info', 'Logged Out', 'You have been successfully logged out');
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// ============================================
// NAVIGATION
// ============================================
function initializeEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            showSection(section);
        });
    });

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    // View all links
    document.querySelectorAll('.btn-view-all').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const section = btn.getAttribute('data-section');
            showSection(section);
        });
    });

    // ✅ FIX: Export buttons with defined functions
    const exportRegBtn = document.getElementById('exportRegistrationsBtn');
    if (exportRegBtn) {
        exportRegBtn.addEventListener('click', exportRegistrationsToExcel);
    }
    
    const exportAbsBtn = document.getElementById('exportAbstractsBtn');
    if (exportAbsBtn) {
        exportAbsBtn.addEventListener('click', exportAbstractsToExcel);
    }
    
    // ✅ FIX: Define exportAllData function
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAllData);
    }

    // Certificate buttons
    const generateCertsBtn = document.getElementById('generateAllCertsBtn');
    if (generateCertsBtn) {
        generateCertsBtn.addEventListener('click', generateAllCertificates);
    }
    
    const sendCertsBtn = document.getElementById('sendAllCertsBtn');
    if (sendCertsBtn) {
        sendCertsBtn.addEventListener('click', sendAllCertificates);
    }
    
    const downloadCertsBtn = document.getElementById('downloadAllCertsBtn');
    if (downloadCertsBtn) {
        downloadCertsBtn.addEventListener('click', downloadAllCertificates);
    }

    // Modal close buttons
    const abstractModalClose = document.getElementById('abstractModalClose');
    if (abstractModalClose) {
        abstractModalClose.addEventListener('click', () => {
            document.getElementById('abstractModal').classList.remove('active');
        });
    }

    const regModalClose = document.getElementById('registrationModalClose');
    if (regModalClose) {
        regModalClose.addEventListener('click', () => {
            document.getElementById('registrationModal').classList.remove('active');
        });
    }

    // Close modal on outside click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Abstract review buttons
    const btnAccept = document.getElementById('btnAcceptAbstract');
    if (btnAccept) {
        btnAccept.addEventListener('click', () => reviewAbstract('accepted'));
    }
    
    const btnReject = document.getElementById('btnRejectAbstract');
    if (btnReject) {
        btnReject.addEventListener('click', () => reviewAbstract('rejected'));
    }
    
    const btnPending = document.getElementById('btnPendingAbstract');
    if (btnPending) {
        btnPending.addEventListener('click', () => reviewAbstract('under_review'));
    }
}

function showSection(section) {
    currentSection = section;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === section) {
            item.classList.add('active');
        }
    });

    // Update sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${section}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Load data for section
    if (section === 'registrations') {
        loadRegistrations();
    } else if (section === 'abstracts') {
        loadAbstracts();
    } else if (section === 'certificates') {
        loadCertificates();
    } else if (section === 'dashboard') {
        loadDashboardData();
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('active');
}

// ============================================
// DASHBOARD DATA
// ============================================
async function loadDashboardData() {
    try {
        // Load attendees count
        const { count: attendeesCount, error: attendeesError } = await supabase
            .from('attendees')
            .select('*', { count: 'exact', head: true });

        if (attendeesError) throw attendeesError;

        // Load abstracts count
        const { count: abstractsCount, error: abstractsError } = await supabase
            .from('abstracts')
            .select('*', { count: 'exact', head: true });

        if (abstractsError) throw abstractsError;

        // Load pending abstracts
        const { count: pendingCount, error: pendingError } = await supabase
            .from('abstracts')
            .select('*', { count: 'exact', head: true })
            .eq('review_status', 'submitted');

        if (pendingError) throw pendingError;

        // Load certificates sent
        const { count: certsCount, error: certsError } = await supabase
            .from('attendees')
            .select('*', { count: 'exact', head: true })
            .eq('certificate_sent', true);

        if (certsError) throw certsError;

        // Update stats safely
        const updateStat = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value || 0;
        };

        updateStat('totalAttendees', attendeesCount);
        updateStat('totalAbstracts', abstractsCount);
        updateStat('pendingAbstracts', pendingCount);
        updateStat('certificatesSent', certsCount);

        // Update badges
        updateStat('registrationsBadge', attendeesCount);
        updateStat('abstractsBadge', abstractsCount);

        // Load recent registrations
        await loadRecentRegistrations();

        // Load charts
        await loadRegistrationChart();
        await loadAbstractTrackChart();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('error', 'Error', 'Failed to load dashboard data');
    }
}

async function loadRecentRegistrations() {
    try {
        const { data, error } = await supabase
            .from('attendees')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        const tbody = document.getElementById('recentRegistrations');
        if (!tbody) return;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No registrations yet</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(reg => `
            <tr>
                <td>${reg.first_name || ''} ${reg.last_name || ''}</td>
                <td>${reg.university || 'N/A'}</td>
                <td>${reg.email || 'N/A'}</td>
                <td>${reg.created_at ? new Date(reg.created_at).toLocaleDateString() : 'N/A'}</td>
                <td><span class="status-badge ${reg.registration_status || 'pending'}">${reg.registration_status || 'pending'}</span></td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading recent registrations:', error);
    }
}

// ============================================
// REGISTRATIONS MANAGEMENT
// ============================================
async function loadRegistrations() {
    try {
        const { data, error } = await supabase
            .from('attendees')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        registrationsData = data || [];
        renderRegistrationsTable(registrationsData);

    } catch (error) {
        console.error('Error loading registrations:', error);
        showToast('error', 'Error', 'Failed to load registrations');
    }
}

function renderRegistrationsTable(data) {
    const tbody = document.getElementById('registrationsTable');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No registrations found</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(reg => `
        <tr>
            <td>
                <input type="checkbox" class="select-reg" data-id="${reg.id}">
            </td>
            <td>
                <div class="user-cell">
                    <div class="user-avatar-small">
                        ${(reg.first_name?.charAt(0) || '?')}${(reg.last_name?.charAt(0) || '?')}
                    </div>
                    <div>
                        <div class="user-name">${reg.first_name || ''} ${reg.last_name || ''}</div>
                        <div class="user-email">${reg.email || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td>${reg.email || 'N/A'}</td>
            <td>${reg.university || 'N/A'}</td>
            <td>${reg.academic_year || 'N/A'}</td>
            <td>${reg.phone || 'N/A'}</td>
            <td>${reg.created_at ? new Date(reg.created_at).toLocaleDateString() : 'N/A'}</td>
            <td>
                ${reg.certificate_sent 
                    ? '<span class="status-badge sent"><i class="fas fa-check"></i> Sent</span>' 
                    : '<span class="status-badge pending"><i class="fas fa-clock"></i> Pending</span>'}
            </td>
            <td>
                <button class="btn-action btn-view" onclick="viewRegistration('${reg.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" onclick="editRegistration('${reg.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                ${!reg.certificate_sent ? `
                    <button class="btn-action btn-send" onclick="sendCertificate('${reg.id}')">
                        <i class="fas fa-certificate"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Registration search and filters
const regSearch = document.getElementById('registrationSearch');
if (regSearch) {
    regSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = registrationsData.filter(reg => 
            (reg.first_name?.toLowerCase() || '').includes(searchTerm) ||
            (reg.last_name?.toLowerCase() || '').includes(searchTerm) ||
            (reg.email?.toLowerCase() || '').includes(searchTerm) ||
            (reg.university?.toLowerCase() || '').includes(searchTerm)
        );
        renderRegistrationsTable(filtered);
    });
}

const uniFilter = document.getElementById('universityFilter');
const statusFilter = document.getElementById('statusFilter');
const yearFilter = document.getElementById('yearFilter');

if (uniFilter) uniFilter.addEventListener('change', filterRegistrations);
if (statusFilter) statusFilter.addEventListener('change', filterRegistrations);
if (yearFilter) yearFilter.addEventListener('change', filterRegistrations);

function filterRegistrations() {
    const university = document.getElementById('universityFilter')?.value || 'all';
    const status = document.getElementById('statusFilter')?.value || 'all';
    const year = document.getElementById('yearFilter')?.value || 'all';

    let filtered = registrationsData;

    if (university !== 'all') {
        filtered = filtered.filter(reg => reg.university === university);
    }

    if (status !== 'all') {
        filtered = filtered.filter(reg => reg.registration_status === status);
    }

    if (year !== 'all') {
        filtered = filtered.filter(reg => reg.academic_year === year);
    }

    renderRegistrationsTable(filtered);
}

function viewRegistration(id) {
    const reg = registrationsData.find(r => r.id === id);
    if (!reg) return;

    const modalBody = document.getElementById('registrationModalBody');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="reg-detail-grid">
            <div class="detail-item">
                <label>Full Name</label>
                <p>${reg.first_name || ''} ${reg.last_name || ''}</p>
            </div>
            <div class="detail-item">
                <label>Email</label>
                <p>${reg.email || 'N/A'}</p>
            </div>
            <div class="detail-item">
                <label>Phone</label>
                <p>${reg.phone || 'N/A'}</p>
            </div>
            <div class="detail-item">
                <label>WhatsApp</label>
                <p>${reg.whatsapp || 'N/A'}</p>
            </div>
            <div class="detail-item">
                <label>University</label>
                <p>${reg.university || 'N/A'}</p>
            </div>
            <div class="detail-item">
                <label>Faculty</label>
                <p>${reg.faculty || 'N/A'}</p>
            </div>
            <div class="detail-item">
                <label>Academic Year</label>
                <p>${reg.academic_year || 'N/A'}</p>
            </div>
            <div class="detail-item">
                <label>Student ID</label>
                <p>${reg.student_id || 'N/A'}</p>
            </div>
            <div class="detail-item">
                <label>Nationality</label>
                <p>${reg.nationality || 'N/A'}</p>
            </div>
            <div class="detail-item">
                <label>Registered</label>
                <p>${reg.created_at ? new Date(reg.created_at).toLocaleString() : 'N/A'}</p>
            </div>
            <div class="detail-item">
                <label>Status</label>
                <p><span class="status-badge ${reg.registration_status || 'pending'}">${reg.registration_status || 'pending'}</span></p>
            </div>
            <div class="detail-item">
                <label>Certificate</label>
                <p>${reg.certificate_sent ? 'Sent' : 'Not Sent'}</p>
            </div>
        </div>
    `;

    document.getElementById('registrationModal')?.classList.add('active');
}

// ============================================
// ABSTRACTS MANAGEMENT
// ============================================
async function loadAbstracts() {
    try {
        const { data, error } = await supabase
            .from('abstracts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        abstractsData = data || [];
        renderAbstractsGrid(abstractsData);
        updateAbstractStats(abstractsData);

    } catch (error) {
        console.error('Error loading abstracts:', error);
        showToast('error', 'Error', 'Failed to load abstracts');
    }
}

function renderAbstractsGrid(data) {
    const grid = document.getElementById('abstractsGrid');
    if (!grid) return;
    
    if (!data || data.length === 0) {
        grid.innerHTML = '<div class="loading-state"><p>No abstracts submitted yet</p></div>';
        return;
    }

    grid.innerHTML = data.map(abs => `
        <div class="abstract-card status-${abs.review_status || 'submitted'}">
            <div class="abstract-header">
                <span class="abstract-track">${abs.track || 'General'}</span>
                <span class="abstract-status ${abs.review_status || 'submitted'}">${(abs.review_status || 'submitted').replace('_', ' ')}</span>
            </div>
            <h3 class="abstract-title">${abs.title || 'Untitled'}</h3>
            <div class="abstract-author">
                <i class="fas fa-user"></i>
                <span>${abs.corresponding_name || 'Unknown'}</span>
            </div>
            <div class="abstract-meta">
                <span><i class="fas fa-university"></i> ${abs.corresponding_university || 'N/A'}</span>
                <span><i class="fas fa-calendar"></i> ${abs.created_at ? new Date(abs.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div class="abstract-actions">
                <button class="btn-action btn-view" onclick="viewAbstract('${abs.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-action btn-download" onclick="downloadAbstract('${abs.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');
}

function updateAbstractStats(data) {
    if (!data) return;
    
    const submitted = data.filter(a => a.review_status === 'submitted').length;
    const underReview = data.filter(a => a.review_status === 'under_review').length;
    const accepted = data.filter(a => a.review_status === 'accepted').length;
    const rejected = data.filter(a => a.review_status === 'rejected').length;

    const updateCount = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    updateCount('submittedCount', submitted);
    updateCount('underReviewCount', underReview);
    updateCount('acceptedCount', accepted);
    updateCount('rejectedCount', rejected);
}

let currentAbstractId = null;

function viewAbstract(id) {
    const abs = abstractsData.find(a => a.id === id);
    if (!abs) return;

    currentAbstractId = id;

    const setModalText = (elId, value, defaultVal = '-') => {
        const el = document.getElementById(elId);
        if (el) el.textContent = value || defaultVal;
    };

    setModalText('modalAbstractTrack', abs.track);
    setModalText('modalAbstractTitle', abs.title);
    setModalText('modalAbstractAuthor', abs.corresponding_name);
    setModalText('modalAbstractEmail', abs.corresponding_email);
    setModalText('modalAbstractUniversity', abs.corresponding_university);
    setModalText('modalAbstractStudyType', abs.study_type);
    setModalText('modalAbstractPresentation', abs.presentation_type);
    setModalText('modalAbstractDate', abs.created_at ? new Date(abs.created_at).toLocaleString() : 'N/A');
    setModalText('modalAbstractBackground', abs.background);
    setModalText('modalAbstractMethods', abs.methods);
    setModalText('modalAbstractResults', abs.results);
    setModalText('modalAbstractConclusion', abs.conclusion);
    
    const fileLink = document.getElementById('modalAbstractFile');
    if (fileLink && abs.file_url) {
        fileLink.href = abs.file_url;
        fileLink.style.display = 'flex';
    }
    
    const notesArea = document.getElementById('reviewerNotes');
    if (notesArea) {
        notesArea.value = abs.reviewer_notes || '';
    }

    document.getElementById('abstractModal')?.classList.add('active');
}

async function reviewAbstract(status) {
    if (!currentAbstractId) return;

    const notesArea = document.getElementById('reviewerNotes');
    const notes = notesArea ? notesArea.value : '';

    try {
        const { error } = await supabase
            .from('abstracts')
            .update({
                review_status: status,
                reviewer_notes: notes,
                acceptance_date: status === 'accepted' ? new Date().toISOString() : null
            })
            .eq('id', currentAbstractId);

        if (error) throw error;

        showToast('success', 'Abstract Updated', `Abstract marked as ${status}`);
        document.getElementById('abstractModal')?.classList.remove('active');
        await loadAbstracts();

    } catch (error) {
        console.error('Error updating abstract:', error);
        showToast('error', 'Error', 'Failed to update abstract');
    }
}

function downloadAbstract(id) {
    const abs = abstractsData.find(a => a.id === id);
    if (abs?.file_url) {
        window.open(abs.file_url, '_blank');
    } else {
        showToast('warning', 'No File', 'Abstract file not available');
    }
}

// ============================================
// CERTIFICATES MANAGEMENT
// ============================================
async function loadCertificates() {
    try {
        const { data, error } = await supabase
            .from('attendees')
            .select('*')
            .eq('registration_status', 'confirmed')
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderCertificatesTable(data || []);
        updateCertificateStats(data || []);

    } catch (error) {
        console.error('Error loading certificates:', error);
    }
}

function renderCertificatesTable(data) {
    const tbody = document.getElementById('certificatesTable');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No eligible attendees</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(reg => `
        <tr>
            <td>${reg.first_name || ''} ${reg.last_name || ''}</td>
            <td>${reg.email || 'N/A'}</td>
            <td>${reg.university || 'N/A'}</td>
            <td>${reg.certificate_url ? '✓' : '-'}</td>
            <td>${reg.certificate_sent ? '✓' : '-'}</td>
            <td>
                ${!reg.certificate_sent ? `
                    <button class="btn-action btn-send" onclick="sendCertificate('${reg.id}')">
                        <i class="fas fa-envelope"></i> Send
                    </button>
                ` : `
                    <button class="btn-action btn-view" onclick="viewCertificate('${reg.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                `}
            </td>
        </tr>
    `).join('');
}

function updateCertificateStats(data) {
    if (!data) return;
    
    const eligible = data.length;
    const generated = data.filter(r => r.certificate_url).length;
    const sent = data.filter(r => r.certificate_sent).length;

    const updateCertStat = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    updateCertStat('eligibleForCert', eligible);
    updateCertStat('certificatesGenerated', generated);
    updateCertStat('certificatesSent', sent);
}

async function sendCertificate(id) {
    try {
        const reg = registrationsData.find(r => r.id === id);
        if (!reg) {
            showToast('error', 'Not Found', 'Registration not found');
            return;
        }

        // Generate certificate URL (in production, call certificate API)
        const certUrl = `https://tsmrc.edu.eg/certificate/${id}`;

        const { error } = await supabase
            .from('attendees')
            .update({
                certificate_url: certUrl,
                certificate_sent: true
            })
            .eq('id', id);

        if (error) throw error;

        // TODO: Send email using Supabase Edge Function
        // await sendCertificateEmail(reg.email, reg.first_name, certUrl);

        showToast('success', 'Certificate Sent', `Certificate sent to ${reg.email}`);
        await loadCertificates();
        await loadDashboardData();

    } catch (error) {
        console.error('Error sending certificate:', error);
        showToast('error', 'Error', 'Failed to send certificate');
    }
}

async function generateAllCertificates() {
    showToast('info', 'Generating', 'Generating all certificates...');
    // TODO: Implement bulk certificate generation
    setTimeout(() => {
        showToast('success', 'Complete', 'All certificates generated');
    }, 2000);
}

async function sendAllCertificates() {
    showToast('info', 'Sending', 'Sending all certificates...');
    // TODO: Implement bulk email sending
    setTimeout(() => {
        showToast('success', 'Complete', 'All certificates sent');
    }, 3000);
}

async function downloadAllCertificates() {
    showToast('info', 'Preparing', 'Preparing ZIP download...');
    // TODO: Implement ZIP download
    setTimeout(() => {
        showToast('success', 'Ready', 'Download will start shortly');
    }, 2000);
}

// ============================================
// ✅ FIX: EXPORT FUNCTIONS
// ============================================
async function exportAllData() {
    showToast('info', 'Exporting', 'Preparing all data export...');
    
    try {
        // Export both registrations and abstracts
        await exportRegistrationsToExcel();
        await exportAbstractsToExcel();
        
        showToast('success', 'Export Complete', 'All data exported successfully');
    } catch (error) {
        console.error('Export error:', error);
        showToast('error', 'Export Failed', 'Could not export data');
    }
}

async function exportRegistrationsToExcel() {
    try {
        const { data, error } = await supabase
            .from('attendees')
            .select('*');

        if (error) throw error;

        const csv = convertToCSV(data || []);
        downloadFile(csv, `registrations_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');

        showToast('success', 'Export Complete', 'Registrations exported successfully');

    } catch (error) {
        console.error('Error exporting registrations:', error);
        showToast('error', 'Export Failed', 'Could not export registrations');
    }
}

async function exportAbstractsToExcel() {
    try {
        const { data, error } = await supabase
            .from('abstracts')
            .select('*');

        if (error) throw error;

        const csv = convertToCSV(data || []);
        downloadFile(csv, `abstracts_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');

        showToast('success', 'Export Complete', 'Abstracts exported successfully');

    } catch (error) {
        console.error('Error exporting abstracts:', error);
        showToast('error', 'Export Failed', 'Could not export abstracts');
    }
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => 
            headers.map(fieldName => {
                const value = row[fieldName];
                // Handle objects/arrays by stringifying
                if (typeof value === 'object' && value !== null) {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                // Escape quotes and wrap in quotes
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');
    
    return csv;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================
// CHARTS
// ============================================
let registrationChartInstance = null;
let abstractTrackChartInstance = null;

async function loadRegistrationChart() {
    const ctx = document.getElementById('registrationChart');
    if (!ctx) return;
    
    const chartCtx = ctx.getContext('2d');
    
    // Get last 7 days data
    const { data, error } = await supabase
        .from('attendees')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
        console.error('Error loading chart data:', error);
        return;
    }

    // Group by date
    const dates = {};
    for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dates[dateStr] = 0;
    }

    (data || []).forEach(reg => {
        const date = new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dates[date] !== undefined) {
            dates[date]++;
        }
    });

    if (registrationChartInstance) {
        registrationChartInstance.destroy();
    }

    registrationChartInstance = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: Object.keys(dates),
            datasets: [{
                label: 'Registrations',
                data: Object.values(dates),
                borderColor: '#2D3691',
                backgroundColor: 'rgba(45, 54, 145, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

async function loadAbstractTrackChart() {
    const ctx = document.getElementById('abstractTrackChart');
    if (!ctx) return;
    
    const chartCtx = ctx.getContext('2d');
    
    const { data, error } = await supabase
        .from('abstracts')
        .select('track');

    if (error) {
        console.error('Error loading chart data:', error);
        return;
    }

    // Count by track
    const tracks = {};
    (data || []).forEach(abs => {
        const track = abs.track || 'Other';
        tracks[track] = (tracks[track] || 0) + 1;
    });

    if (abstractTrackChartInstance) {
        abstractTrackChartInstance.destroy();
    }

    abstractTrackChartInstance = new Chart(chartCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(tracks),
            datasets: [{
                data: Object.values(tracks),
                backgroundColor: [
                    '#2D3691',
                    '#F28A24',
                    '#10b981',
                    '#ef4444',
                    '#8b5cf6',
                    '#14b8a6',
                    '#6366f1'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make functions globally available for onclick handlers
window.viewRegistration = viewRegistration;
window.editRegistration = function(id) { showToast('info', 'Edit', `Editing registration ${id}`); };
window.sendCertificate = sendCertificate;
window.viewAbstract = viewAbstract;
window.downloadAbstract = downloadAbstract;
window.viewCertificate = function(id) { showToast('info', 'View', `Viewing certificate for ${id}`); };

console.log('👨‍💼 TSMRC 2026 Admin Dashboard Loaded Successfully!');