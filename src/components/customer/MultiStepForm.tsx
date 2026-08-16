import React, { useState } from 'react';
import type { 
  Complaint, MachineType, MachineAge, ProblemType, 
  CustomerDetails, MachineDetails, ProblemDetails, BusinessSettings 
} from '../../types';
import { generateNextComplaintId, saveComplaint, addAuditLog } from '../../services/storage';
import { buildWhatsAppUrl, createCustomerWhatsAppMessage } from '../../utils/whatsapp';
import confetti from 'canvas-confetti';
import { 
  Wrench, CheckCircle, ArrowLeft, ArrowRight, Upload, Phone, 
  MapPin, AlertCircle, CheckCircle2 
} from 'lucide-react';

interface MultiStepFormProps {
  settings: BusinessSettings;
  onNavigate: (tab: string, param?: string) => void;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({ settings, onNavigate }) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);

  // Form State
  const [machine, setMachine] = useState<MachineDetails>({
    brand: 'LG',
    otherBrand: '',
    type: 'Fully Automatic Top Load',
    age: '1–3 years'
  });

  const [problem, setProblem] = useState<ProblemDetails>({
    selectedProblems: [],
    errorCode: '',
    additionalDetails: '',
    photoUrl: ''
  });

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    mobile: '',
    whatsapp: '',
    whatsappSameAsMobile: true,
    houseNo: '',
    streetArea: '',
    landmark: '',
    city: 'Indore',
    pincode: '452009'
  });

  const [errorMsg, setErrorMsg] = useState<string>('');

  // Options Lists
  const brandList = ['LG', 'Samsung', 'Whirlpool', 'IFB', 'Bosch', 'Haier', 'Godrej', 'Panasonic', 'Videocon', 'Other'];
  
  const machineTypes: MachineType[] = [
    'Fully Automatic Top Load',
    'Fully Automatic Front Load',
    'Semi Automatic',
    'Washer Dryer',
    'Other'
  ];

  const ageOptions: MachineAge[] = [
    'Less than 1 year',
    '1–3 years',
    '3–5 years',
    '5–8 years',
    'More than 8 years',
    "Don't know"
  ];

  const problemOptions: { type: ProblemType; label: string; icon: string }[] = [
    { type: 'Not Starting', label: 'Not Starting', icon: '⚡' },
    { type: 'Not Draining Water', label: 'Not Draining Water', icon: '💧' },
    { type: 'Not Filling Water', label: 'Not Filling Water', icon: '🚰' },
    { type: 'Making Noise', label: 'Making Noise', icon: '🔊' },
    { type: 'Not Spinning', label: 'Not Spinning', icon: '🔄' },
    { type: 'Not Washing Properly', label: 'Not Washing Properly', icon: '🧼' },
    { type: 'Water Leakage', label: 'Water Leakage', icon: '💦' },
    { type: 'Door/Lid Problem', label: 'Door / Lid Problem', icon: '🚪' },
    { type: 'Error Code', label: 'Error Code Shown', icon: '⚠️' },
    { type: 'Electricity/Shock Problem', label: 'Electricity / Shock', icon: '⚡' },
    { type: 'Dryer Problem', label: 'Dryer Problem', icon: '🌀' },
    { type: 'Other Problem', label: 'Other Problem', icon: '🔧' },
    { type: "I don't know what's wrong", label: "I don't know what's wrong", icon: '❓' }
  ];

  // Handlers
  const handleProblemToggle = (prob: ProblemType) => {
    if (prob === "I don't know what's wrong") {
      setProblem(prev => ({ ...prev, selectedProblems: ["I don't know what's wrong"] }));
      return;
    }

    let updated: ProblemType[] = prevSelectedWithoutDontKnow(problem.selectedProblems);
    if (updated.includes(prob)) {
      updated = updated.filter(p => p !== prob);
    } else {
      updated.push(prob);
    }

    if (updated.length === 0) {
      updated = ["I don't know what's wrong"];
    }

    setProblem(prev => ({ ...prev, selectedProblems: updated }));
  };

  const prevSelectedWithoutDontKnow = (list: ProblemType[]): ProblemType[] => {
    return list.filter((p): p is ProblemType => p !== "I don't know what's wrong");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProblem(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setCustomer(prev => ({
            ...prev,
            streetArea: 'Annapurna Road (Detected)',
            pincode: '452009'
          }));
        },
        () => {
          alert('Location permission denied or unavailable. Please enter address manually.');
        }
      );
    }
  };

  // Step Validation
  const validateStep = (currentStep: number): boolean => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (machine.brand === 'Other' && !machine.otherBrand?.trim()) {
        setErrorMsg('Please enter your washing machine brand name.');
        return false;
      }
      if (problem.selectedProblems.length === 0) {
        setErrorMsg('Please select at least one problem option.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!customer.name.trim()) {
        setErrorMsg('Please enter your full name.');
        return false;
      }
      if (!customer.mobile.trim() || customer.mobile.length < 10) {
        setErrorMsg('Please enter a valid 10-digit phone number.');
        return false;
      }
      if (!customer.houseNo.trim() || !customer.streetArea.trim()) {
        setErrorMsg('Please enter your house/flat number and street/area address.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submit
  const handleSubmit = () => {
    if (!validateStep(2)) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newId = generateNextComplaintId();
      const finalWhatsAppNumber = customer.whatsappSameAsMobile ? customer.mobile : (customer.whatsapp || customer.mobile);

      const newComplaint: Complaint = {
        id: newId,
        customer: {
          ...customer,
          whatsapp: finalWhatsAppNumber
        },
        machine: {
          ...machine,
          brand: machine.brand === 'Other' ? (machine.otherBrand || 'Other') : machine.brand
        },
        problem,
        visit: {
          date: 'ASAP / Immediate',
          timeSlot: 'As soon as possible'
        },
        status: 'New Complaint',
        timeline: [
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toLocaleString('en-US', { hour12: true }),
            status: 'New Complaint',
            title: 'Repair Request Submitted',
            description: 'Service complaint successfully registered by customer.',
            author: 'Customer'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveComplaint(newComplaint);
      addAuditLog('Customer', 'SUBMIT_COMPLAINT', `Customer ${customer.name} submitted complaint ${newId}`);

      setCreatedComplaint(newComplaint);
      setIsSubmitting(false);

      // Trigger Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 600);
  };

  // Render SUCCESS SCREEN
  if (createdComplaint) {
    const whatsappMsg = createCustomerWhatsAppMessage(createdComplaint, settings);
    const whatsappLink = buildWhatsAppUrl(settings.whatsapp, whatsappMsg);

    return (
      <div className="card animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '3px solid #86efac' }}>
          <CheckCircle2 size={48} />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Complaint Registered Successfully!
        </h1>

        <p style={{ color: '#475569', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
          Our service team has received your complaint and will contact you directly on your phone.
        </p>

        {/* Highlighted Complaint ID Badge */}
        <div style={{ backgroundColor: '#eff6ff', border: '2px dashed #3b82f6', borderRadius: '16px', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            YOUR UNIQUE COMPLAINT NUMBER
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.05em', margin: '0.2rem 0' }}>
            {createdComplaint.id}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Save this ID to track your complaint status anytime online.
          </p>
        </div>

        {/* Summary Card */}
        <div style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', border: '1px solid #e2e8f0', fontSize: '0.925rem' }}>
          <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.75rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.4rem' }}>
            Submitted Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><strong>Name:</strong> {createdComplaint.customer.name}</div>
            <div><strong>Phone:</strong> {createdComplaint.customer.mobile}</div>
            <div><strong>Machine:</strong> {createdComplaint.machine.brand} ({createdComplaint.machine.type})</div>
            <div><strong>Problem:</strong> {createdComplaint.problem.selectedProblems.join(', ')}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {createdComplaint.customer.houseNo}, {createdComplaint.customer.streetArea}, {createdComplaint.customer.city} - {createdComplaint.customer.pincode}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={() => onNavigate('track-complaint', createdComplaint.id)}
            className="btn btn-primary btn-lg btn-block"
          >
            <CheckCircle size={20} /> Track Complaint Status
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <a 
              href={`tel:${settings.phone}`} 
              className="btn btn-secondary btn-block"
            >
              <Phone size={18} /> Call Service Center
            </a>

            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-success btn-block"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
      
      {/* Page Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
          Book a Washing Machine Repair
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          Tell us your machine problem & contact details — simple & fast!
        </p>
      </div>

      {/* 2-Step Progress Bar */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1rem 1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {[
            { stepNum: 1, label: '1. Machine & Problem' },
            { stepNum: 2, label: '2. Name, Phone & Address' }
          ].map((item, idx) => (
            <React.Fragment key={item.stepNum}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div 
                  style={{ 
                    width: '34px', height: '34px', borderRadius: '50%', 
                    backgroundColor: step === item.stepNum ? '#1d4ed8' : step > item.stepNum ? '#059669' : '#f1f5f9', 
                    color: step >= item.stepNum ? '#ffffff' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.95rem'
                  }}
                >
                  {step > item.stepNum ? <CheckCircle size={20} /> : item.stepNum}
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: step === item.stepNum ? 800 : 500, color: step === item.stepNum ? '#0f172a' : '#64748b' }}>
                  {item.label}
                </span>
              </div>
              {idx === 0 && <div style={{ flex: 1, height: '3px', backgroundColor: step > 1 ? '#059669' : '#e2e8f0', margin: '0 1rem' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.925rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="card" style={{ padding: '2rem 1.5rem' }}>
        
        {/* STEP 1: MACHINE & PROBLEM DETAILS */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={22} style={{ color: '#1d4ed8' }} /> Step 1 — Select Machine & Problem
            </h2>

            {/* Brand Dropdown */}
            <div className="form-group">
              <label className="form-label">
                Washing Machine Brand <span className="required">*</span>
              </label>
              <select 
                value={machine.brand} 
                onChange={(e) => setMachine(prev => ({ ...prev, brand: e.target.value }))}
                className="form-select"
              >
                {brandList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {machine.brand === 'Other' && (
              <div className="form-group">
                <label className="form-label">
                  Specify Brand Name <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Siemens, Kelvinator, IFB, etc." 
                  value={machine.otherBrand || ''}
                  onChange={(e) => setMachine(prev => ({ ...prev, otherBrand: e.target.value }))}
                  className="form-input"
                />
              </div>
            )}

            {/* Machine Type */}
            <div className="form-group">
              <label className="form-label">
                Machine Type <span className="required">*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {machineTypes.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMachine(prev => ({ ...prev, type: t }))}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: machine.type === t ? '2px solid #1d4ed8' : '1px solid #cbd5e1',
                      backgroundColor: machine.type === t ? '#eff6ff' : '#ffffff',
                      color: machine.type === t ? '#1d4ed8' : '#334155',
                      fontWeight: machine.type === t ? 700 : 500,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Machine Age */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Approximate Machine Age</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {ageOptions.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setMachine(prev => ({ ...prev, age: a }))}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: machine.age === a ? '2px solid #1d4ed8' : '1px solid #cbd5e1',
                      backgroundColor: machine.age === a ? '#eff6ff' : '#ffffff',
                      color: machine.age === a ? '#1d4ed8' : '#334155',
                      fontWeight: machine.age === a ? 700 : 500,
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Selection */}
            <div style={{ marginTop: '1.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                Select Problem(s) <span className="required">*</span>
              </label>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Click one or more problems you are experiencing with your washing machine
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {problemOptions.map(opt => {
                  const isSelected = problem.selectedProblems.includes(opt.type);
                  const isDontKnow = opt.type === "I don't know what's wrong";

                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => handleProblemToggle(opt.type)}
                      style={{
                        padding: '0.85rem 0.65rem',
                        borderRadius: '12px',
                        border: isSelected ? `2px solid ${isDontKnow ? '#d97706' : '#1d4ed8'}` : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? (isDontKnow ? '#fffbebf' : '#eff6ff') : '#ffffff',
                        color: isSelected ? (isDontKnow ? '#92400e' : '#1d4ed8') : '#1e293b',
                        fontWeight: isSelected ? 700 : 500,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.4rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Error Code optional field */}
              {problem.selectedProblems.includes('Error Code') && (
                <div className="form-group animate-fade-in" style={{ backgroundColor: '#fffbebf', padding: '1rem', borderRadius: '10px', border: '1px solid #fef08a' }}>
                  <label className="form-label">Enter Error Code Shown (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. OE, UE, 4E, E10, etc." 
                    value={problem.errorCode || ''}
                    onChange={(e) => setProblem(prev => ({ ...prev, errorCode: e.target.value }))}
                    className="form-input"
                  />
                </div>
              )}

              {/* Photo upload optional */}
              <div className="form-group">
                <label className="form-label">Upload Photo of Machine or Problem (Optional)</label>
                <div style={{ border: '2px dashed #cbd5e1', padding: '1rem', borderRadius: '10px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  {problem.photoUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                      <img src={problem.photoUrl} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      <button type="button" onClick={() => setProblem(prev => ({ ...prev, photoUrl: '' }))} className="btn btn-sm btn-secondary">
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                      <Upload size={24} style={{ color: '#1d4ed8' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1d4ed8' }}>Click to attach image</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              {/* Additional details */}
              <div className="form-group">
                <label className="form-label">Additional Description / Notes (Optional)</label>
                <textarea 
                  rows={2}
                  placeholder="Describe what happens when you turn on the machine..."
                  value={problem.additionalDetails || ''}
                  onChange={(e) => setProblem(prev => ({ ...prev, additionalDetails: e.target.value }))}
                  className="form-textarea"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: NAME, PHONE & ADDRESS ONLY */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Step 2 — Contact & Address Details
            </h2>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  Your Full Name <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  value={customer.name}
                  onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <input 
                  type="tel" 
                  placeholder="10-digit mobile number" 
                  value={customer.mobile}
                  onChange={(e) => setCustomer(prev => ({ ...prev, mobile: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Complete Service Address <span className="required">*</span>
              </label>
              <button 
                type="button" 
                onClick={handleUseLocation}
                className="btn btn-sm btn-outline-primary"
                style={{ height: '32px' }}
              >
                <MapPin size={14} /> Detect Location
              </button>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="House / Flat / Building No. *" 
                  value={customer.houseNo}
                  onChange={(e) => setCustomer(prev => ({ ...prev, houseNo: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Street / Area / Colony *" 
                  value={customer.streetArea}
                  onChange={(e) => setCustomer(prev => ({ ...prev, streetArea: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Landmark (Optional)" 
                  value={customer.landmark || ''}
                  onChange={(e) => setCustomer(prev => ({ ...prev, landmark: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="City" 
                  value={customer.city}
                  onChange={(e) => setCustomer(prev => ({ ...prev, city: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Pincode" 
                  value={customer.pincode}
                  onChange={(e) => setCustomer(prev => ({ ...prev, pincode: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation / Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
          {step === 2 ? (
            <button type="button" onClick={prevStep} className="btn btn-secondary">
              <ArrowLeft size={18} /> Back
            </button>
          ) : <div />}

          {step === 1 ? (
            <button type="button" onClick={nextStep} className="btn btn-primary btn-lg">
              Next: Name & Address <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Service Request'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
