import React from 'react';

export default function Legal() {
  return (
    <div className="min-h-screen bg-[#f5f1eb]">
    
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Last Updated */}
          <div className="pb-6 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-[#1a2332] text-center">
          Legal
          </h1>
            <p className="text-sm text-gray-600 font-semibold mb-4">
              Last Updated: January 21, 2025
            </p>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Curefy! These Legal ("Legal") govern your use of our 
              website, services, and any related content. By accessing or using Curefy, you agree 
              to comply with these Terms. If you do not agree, please refrain from using our 
              services.
            </p>
          </div>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-[#1a2332] mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By using Curefy, you confirm that you are at least 18 years old or have parental/
              legal guardian consent. You also agree to abide by all applicable laws and 
              regulations while using our services.
            </p>
          </section>

          {/* Use of Our Services */}
          <section>
            <h2 className="text-2xl font-bold text-[#1a2332] mb-4">
              Use of Our Services
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may use Curefy for personal and non-commercial purposes related to 
              healthcare. You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide false or misleading medical information.</li>
              <li>Use our platform for illegal, fraudulent, or harmful activities.</li>
              <li>Attempt to access or manipulate our systems without authorization.</li>
              <li>Violate any applicable laws or third-party rights.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We reserve the right to suspend or terminate access to our services if these Terms 
              are violated.
            </p>
          </section>

          {/* Medical Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-[#1a2332] mb-4">
              Medical Disclaimer
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Curefy provides healthcare services but does not replace professional medical 
              advice. While our medical professionals offer guidance, always consult your 
              primary care physician before making health-related decisions. We do not 
              guarantee specific medical outcomes.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold">Emergency Notice:</span> If you have a medical emergency, call 911 or seek immediate 
              medical attention.
            </p>
          </section>

          {/* Appointments & Cancellations */}
          <section>
            <h2 className="text-2xl font-bold text-[#1a2332] mb-4">
              Appointments & Cancellations
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li>
                <span className="font-semibold">• Booking:</span> You can schedule appointments through our website or by phone.
              </li>
              <li>
                <span className="font-semibold">• Cancellations:</span> Cancellations must be made at least 24 hours in advance to 
                avoid fees.
              </li>
              <li>
                <span className="font-semibold">• No-Show Policy:</span> Missed appointments may result in service charges.
              </li>
              <li>
                <span className="font-semibold">• Rescheduling:</span> Subject to availability, appointments may be rescheduled upon 
                request.
              </li>
            </ul>
          </section>

          {/* Privacy & Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-[#1a2332] mb-4">
              Privacy & Data Protection
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect and process personal data in accordance with our{' '}
              <span className="font-semibold">Privacy Policy</span>. Key 
              terms:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li>
                <span className="font-semibold">• Data Collection:</span> We gather personal and medical information to provide better 
                care.
              </li>
              <li>
                <span className="font-semibold">• Data Security:</span> We implement strong security measures to protect your
              </li>
            </ul>
          </section>
        </div>
      </main>


    </div>
  );
}