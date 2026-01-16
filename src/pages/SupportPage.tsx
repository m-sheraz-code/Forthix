import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, HelpCircle } from 'lucide-react';

export default function SupportPage() {
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
                    Support Center
                </h1>
                <p className="text-base text-gray-400 mb-12">
                    We're here to help you get the most out of Forthix
                </p>

                <div className="grid gap-6 sm:gap-8 mb-12">
                    {/* Contact Options */}
                    <div className="rounded-2xl border border-white/5 bg-gray-900/50 p-6 hover:bg-gray-900/70 transition-all">
                        <Mail className="h-8 w-8 text-blue-500 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Email Support</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Get in touch with our support team via email
                        </p>
                        <a
                            href="mailto:support@forthix.com"
                            className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            support@forthix.com →
                        </a>
                    </div>

                    {/* FAQ Section */}
                    <div className="rounded-2xl border border-white/5 bg-gray-900/50 p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <HelpCircle className="h-6 w-6 text-purple-500" />
                            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-base font-semibold text-white mb-2">
                                    How do I create an account?
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Click on the "Get Started" button on the homepage and follow the registration process.
                                    You'll need to provide an email address and create a secure password.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-white mb-2">
                                    Is my trading data secure?
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Yes, we use industry-standard encryption and security measures to protect your data.
                                    Read our Privacy Policy for more details on how we handle your information.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-white mb-2">
                                    Can I export my chart analysis?
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Yes, you can save your charts and export them as images or share them with the community.
                                    Use the save button in the Chart Editor to get started.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-white mb-2">
                                    What markets does Forthix cover?
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Forthix provides real-time data for stocks, indices, cryptocurrencies, and commodities
                                    from major exchanges worldwide including NYSE, NASDAQ, and more.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-white mb-2">
                                    How do I report a bug or issue?
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Please email us at support@forthix.com with details about the issue you're experiencing,
                                    including screenshots if possible. Our team will investigate and respond promptly.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Resources */}
                    <div className="rounded-2xl border border-white/5 bg-gray-900/50 p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Additional Resources</h2>
                        <div className="space-y-3">
                            <Link
                                to="/terms"
                                className="block text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                → Terms of Service
                            </Link>
                            <Link
                                to="/privacy"
                                className="block text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                → Privacy Policy
                            </Link>
                            <Link
                                to="/cookies"
                                className="block text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                → Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
