document.addEventListener('DOMContentLoaded', () => {
	// --- STATE MANAGEMENT ---
	let disclosures = []; 
	let editingIndex = null;

	// --- DOM ELEMENTS ---
	const modal = document.getElementById('disclosure-modal');
	const openBtn = document.getElementById('open-modal-btn');
	const closeBtn = document.getElementById('close-modal-btn');
	const saveBtn = document.getElementById('save-disclosure-btn');
	const summaryList = document.getElementById('disclosure-summary-list');
	const companyInput = document.getElementById('company-name-input');
	const checkboxes = document.querySelectorAll('input[name="rel"]');
	const otherCheckbox = document.getElementById('rel-other');
    const otherContainer = document.getElementById('other-detail-container');
    const otherInput = document.getElementById('other-detail-input');

	// --- MODAL LOGIC ---

	function toggleModal(show = true) {
	  modal.style.display = show ? 'flex' : 'none';
	  modal.setAttribute('aria-hidden', !show);

	  if (show) {
		companyInput.focus();
	  } else {
		resetModal();
		openBtn.focus(); // Accessibility: return focus to the trigger
	  }
	}

	function resetModal() {
	  companyInput.value = '';
	  checkboxes.forEach(cb => cb.checked = false);
	  editingIndex = null;
	  document.getElementById('modal-title').innerText = "Add Financial Relationship";
	}
	
    // 1. CONDITIONAL VISIBILITY
    otherCheckbox.addEventListener('change', function() {
        otherContainer.style.display = this.checked ? 'block' : 'none';
        if (this.checked) otherInput.focus();
    });

	// --- CORE FUNCTIONALITY ---

    function saveDisclosure() {
        const companyName = companyInput.value.trim();
        const selectedRelationships = [];
        
        checkboxes.forEach(cb => {
            if (cb.checked) {
                let label = cb.value;
                // If it's the 'Other' box, append the detail text
                if (cb.id === 'rel-other' && otherInput.value.trim() !== '') {
                    label += ` (${otherInput.value.trim()})`;
                }
                selectedRelationships.push(label);
            }
        });

        if (!companyName || selectedRelationships.length === 0) {
            alert("Please provide a company name and at least one relationship.");
            return;
        }

        const disclosureData = {
            company: companyName,
            roles: selectedRelationships,
            otherDetail: otherInput.value.trim() // Store raw detail for editing later
        };

        if (editingIndex !== null) {
            disclosures[editingIndex] = disclosureData;
        } else {
            disclosures.push(disclosureData);
        }

        renderList();
        toggleModal(false);
    }
	
    // 3. UPDATED RESET/EDIT LOGIC
    function resetModal() {
        companyInput.value = '';
        checkboxes.forEach(cb => cb.checked = false);
        otherInput.value = '';
        otherContainer.style.display = 'none';
        editingIndex = null;
        document.getElementById('modal-title').innerText = "Add Financial Relationship";
    }

    window.editDisclosure = function(index) {
        const item = disclosures[index];
        editingIndex = index;
        
        companyInput.value = item.company;
        checkboxes.forEach(cb => {
            cb.checked = item.roles.some(role => role.startsWith(cb.value));
        });

        // Handle the 'Other' state specifically
        if (otherCheckbox.checked) {
            otherContainer.style.display = 'block';
            otherInput.value = item.otherDetail || '';
        }

        document.getElementById('modal-title').innerText = "Edit Relationship";
        toggleModal(true);
    };

	function renderList() {
	  summaryList.innerHTML = '';

	  disclosures.forEach((item, index) => {
		const li = document.createElement('li');
		li.className = 'summary-item';
		li.innerHTML = `
		  <div class="summary-content">
			<strong class="company-name">${item.company}</strong>
			<span class="relationship-badges">${item.roles.join(', ')}</span>
		  </div>
		  <button type="button" class="btn-edit" onclick="editDisclosure(${index})">Edit</button>
		  <button type="button" class="btn-remove" onclick="removeDisclosure(${index})">Remove</button>
		`;
		summaryList.appendChild(li);
	  });
	}

	window.removeDisclosure = function(index) {
	  if (confirm("Are you sure you want to remove this disclosure?")) {
		disclosures.splice(index, 1);
		renderList();
	  }
	};

	// --- EVENT LISTENERS ---

	openBtn.addEventListener('click', () => toggleModal(true));
	closeBtn.addEventListener('click', () => toggleModal(false));
	saveBtn.addEventListener('click', saveDisclosure);

	// Close modal if user clicks the dark backdrop
	window.addEventListener('click', (e) => {
	  if (e.target === modal) toggleModal(false);
	});
	
});