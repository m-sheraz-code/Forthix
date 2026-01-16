import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-brand-dark">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Privacy Policy
                </h1>
                <p className="text-sm text-gray-500 mb-12">Last updated: January 16, 2026</p>

                <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2 mb-4">
                            <li>Account information (email, username, password)</li>
                            <li>Profile information and preferences</li>
                            <li>Trading and investment data</li>
                            <li>Communication data when you contact us</li>
                            <li>Usage data and analytics</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2 mb-4">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and send related information</li>
                            <li>Send technical notices, updates, and support messages</li>
                            <li>Respond to your comments and questions</li>
                            <li>Protect against fraudulent or illegal activity</li>
                            <li>Personalize your experience on the platform</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We do not sell, trade, or rent your personal information to third parties. We may share
                            your information only in the following circumstances:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2 mb-4">
                            <li>With your consent</li>
                            <li>To comply with legal obligations</li>
                            <li>To protect our rights and prevent fraud</li>
                            <li>With service providers who assist in our operations</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We implement appropriate technical and organizational measures to protect your personal
                            data against unauthorized or unlawful processing, accidental loss, destruction, or damage.
                            However, no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2 mb-4">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Object to processing of your data</li>
                            <li>Export your data</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We use cookies and similar tracking technologies to track activity on our service and
                            hold certain information. For more details, please see our Cookie Policy.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">7. Changes to This Policy</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We may update our Privacy Policy from time to time. We will notify you of any changes by
                            posting the new Privacy Policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
                        <p className="text-gray-400 leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us through our support
                            page.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
