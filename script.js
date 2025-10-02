// --- JavaScript untuk Logika Aplikasi ---
// let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let appointments = [];
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = today.toISOString().slice(0, 10); // Default ke tanggal hari ini

const monthYearLabel = document.getElementById('month-year-label');
const calendarGrid = document.getElementById('calendar-grid');
const todayAppointmentsDiv = document.getElementById('today-appointments');
const modal = document.getElementById('appointment-modal');
const modalTitle = document.getElementById('modal-title');
const appointmentIdInput = document.getElementById('appointment-id');
const appointmentNameInput = document.getElementById('appointment-name');
const appointmentDoctorInput = document.getElementById('appointment-doctor');
const appointmentDateInput = document.getElementById('appointment-date');
const appointmentTimeInput = document.getElementById('appointment-time');

// --- API untuk dapetin data ---
async function fetchAppointments() {
    try {
        // endpoint Vercel
        const response = await fetch('/api/get-appointments'); 
        if (!response.ok) throw new Error('Failed to fetch appointments');
        appointments = await response.json();
        renderAppointments();
    } catch (error) {
        console.error('Error fetching appointments:', error);
        alert('Gagal memuat jadwal. Silakan coba lagi.');
    }
}

// buat render kalender
function renderCalendar() {
    // ... (kode renderCalendar tetap sama)
    calendarGrid.innerHTML = '';
    const monthName = new Date(currentYear, currentMonth).toLocaleString('id-ID', { month: 'long' });
    monthYearLabel.textContent = `${monthName} ${currentYear}`;

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    dayNames.forEach(day => {
        const dayNameDiv = document.createElement('div');
        dayNameDiv.className = 'day-name';
        dayNameDiv.textContent = day;
        calendarGrid.appendChild(dayNameDiv);
    });

    for (let i = firstDayOfMonth; i > 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = prevMonthLastDate - i + 1;
        calendarGrid.appendChild(dayDiv);
    }

    for (let i = 1; i <= lastDateOfMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day current-month';
        dayDiv.textContent = i;
        const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        if (fullDate === selectedDate) {
            dayDiv.classList.add('selected-date');
        }
        
        if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        dayDiv.addEventListener('click', () => {
            selectedDate = fullDate;
            renderCalendar();
            renderAppointments();
        });
        
        calendarGrid.appendChild(dayDiv);
    }
}

// merender daftar janji temu
function renderAppointments() {
    const selectedAppointments = appointments.filter(a => a.date === selectedDate);
    
    todayAppointmentsDiv.innerHTML = '';

    if (selectedAppointments.length === 0) {
        todayAppointmentsDiv.innerHTML = `<p class="no-appointments">Tidak ada jadwal pada tanggal ini.</p>`;
    } else {
        selectedAppointments.sort((a, b) => {
            const timeA = a.time ? a.time : '00:00';
            const timeB = b.time ? b.time : '00:00';
            return timeA.localeCompare(timeB);
        });
        selectedAppointments.forEach((item, index) => {
            const appointmentEl = createAppointmentElement(item);
            todayAppointmentsDiv.appendChild(appointmentEl);
        });
    }
}

// membuat elemen janji temu
function createAppointmentElement(item) {
    const appointmentEl = document.createElement('div');
    appointmentEl.className = 'appointment-item';

    const htmlContent = `
        <div class="details">
            <h3>${item.name}</h3>
            <div class="meta">
                <span class="time">${item.time}</span>
                <span class="doctor">${item.doctor}</span>
            </div>
        </div>
        <div class="actions">
            <button onclick="openModal('${item.id}')">&#x270E;</button>
            <button onclick="deleteAppointment('${item.id}')">&#x2715;</button>
        </div>
    `;
    
    appointmentEl.innerHTML = htmlContent;
    return appointmentEl;
}

// Fungsi CRUD
async function openModal(id = null) {
    modal.style.display = 'flex';
    if (id) {
        modalTitle.textContent = 'Edit Jadwal';
        const item = appointments.find(a => a.id === id);
        if (item) {
            appointmentIdInput.value = item.id;
            appointmentNameInput.value = item.name;
            appointmentDoctorInput.value = item.doctor;
            appointmentDateInput.value = item.date;
            appointmentTimeInput.value = item.time;
        }
    } else {
        modalTitle.textContent = 'Tambah Jadwal Baru';
        appointmentIdInput.value = '';
        appointmentNameInput.value = '';
        appointmentDoctorInput.value = '';
        appointmentDateInput.value = '';
        appointmentTimeInput.value = '';
    }
}

function closeModal() {
    modal.style.display = 'none';
}

async function saveAppointment() {
    const id = appointmentIdInput.value;
    const name = appointmentNameInput.value.trim();
    const doctor = appointmentDoctorInput.value.trim();
    const date = appointmentDateInput.value;
    const time = appointmentTimeInput.value;

    if (!name || !doctor || !date || !time) {
        alert("Mohon isi semua kolom.");
        return;
    }

    const newAppointment = { id, name, doctor, date, time };
    // PERUBAHAN: Gunakan endpoint Vercel
    let endpoint = '/api/create-appointment';
    let method = 'POST';

    if (id) {
        endpoint = '/api/update-appointment';
        method = 'PUT';
    }

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAppointment)
        });
        if (!response.ok) throw new Error('Failed to save appointment');
        await fetchAppointments(); // Ambil ulang data setelah disimpan
        closeModal();
    } catch (error) {
        console.error('Error saving appointment:', error);
        alert('Gagal menyimpan jadwal. Silakan coba lagi.');
    }
}

async function deleteAppointment(id) {
    if (confirm("Yakin ingin menghapus jadwal ini?")) {
        try {
            // PERUBAHAN: Gunakan endpoint Vercel
            const response = await fetch('/api/delete-appointment', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!response.ok) throw new Error('Failed to delete appointment');
            await fetchAppointments(); // Ambil ulang data setelah dihapus
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Gagal menghapus jadwal. Silakan coba lagi.');
        }
    }
}

// mengganti bulan pada kalender
function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchAppointments(); // Panggil fungsi baru untuk mengambil data
    renderCalendar();
});
