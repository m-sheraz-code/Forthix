import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPage() {
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
                    Cookie Policy
                </h1>
                <p className="text-sm text-gray-500 mb-12">Last updated: January 16, 2026</p>

                <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Cookies are small text files that are placed on your computer or mobile device when you
                            visit a website. They are widely used to make websites work more efficiently and provide
                            information to the owners of the site.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Cookies</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Forthix uses cookies for several purposes:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2 mb-4">
                            <li><strong className="text-white">Essential Cookies:</strong> Required for the website to function properly</li>
                            <li><strong className="text-white">Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
                            <li><strong className="text-white">Functionality Cookies:</strong> Remember your preferences and settings</li>
                            <li><strong className="text-white">Analytics Cookies:</strong> Collect information about how you use our site</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">3. Types of Cookies We Use</h2>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-3">Session Cookies</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Temporary cookies that expire when you close your browser. These are essential for
                                maintaining your login session and ensuring secure access to your account.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-3">Persistent Cookies</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Remain on your device for a set period or until you delete them. These help remember
                                your preferences and provide a personalized experience.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-3">Third-Party Cookies</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Set by third-party services we use, such as analytics providers. These help us
                                understand user behavior and improve our service.
                            </p>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">4. Managing Cookies</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            You have the right to decide whether to accept or reject cookies. You can exercise your
                            cookie preferences by:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2 mb-4">
                            <li>Adjusting your browser settings to refuse all or some browser cookies</li>
                            <li>Deleting cookies that have already been set</li>
                            <li>Using privacy mode or incognito browsing</li>
                        </ul>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Please note that if you choose to block cookies, some parts of our website may not
                            function properly.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">5. Updates to This Policy</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We may update this Cookie Policy from time to time to reflect changes in our practices
                            or for other operational, legal, or regulatory reasons.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">6. Contact Us</h2>
                        <p className="text-gray-400 leading-relaxed">
                            If you have any questions about our use of cookies, please contact us through our support
                            page.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
