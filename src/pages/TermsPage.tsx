import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
                    Terms of Service
                </h1>
                <p className="text-sm text-gray-500 mb-12">Last updated: January 16, 2026</p>

                <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            By accessing and using Forthix ("the Service"), you accept and agree to be bound by the
                            terms and provision of this agreement. If you do not agree to abide by the above, please
                            do not use this service.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Permission is granted to temporarily access the materials (information or software) on
                            Forthix for personal, non-commercial transitory viewing only. This is the grant of a
                            license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2 mb-4">
                            <li>Modify or copy the materials</li>
                            <li>Use the materials for any commercial purpose or for any public display</li>
                            <li>Attempt to reverse engineer any software contained on Forthix</li>
                            <li>Remove any copyright or other proprietary notations from the materials</li>
                            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            The materials on Forthix are provided on an 'as is' basis. Forthix makes no warranties,
                            expressed or implied, and hereby disclaims and negates all other warranties including,
                            without limitation, implied warranties or conditions of merchantability, fitness for a
                            particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            <strong className="text-white">Investment Disclaimer:</strong> The information provided on
                            this platform is for educational and informational purposes only. It should not be considered
                            as financial, investment, or trading advice. Always do your own research and consult with a
                            qualified financial advisor before making investment decisions.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            In no event shall Forthix or its suppliers be liable for any damages (including, without
                            limitation, damages for loss of data or profit, or due to business interruption) arising out
                            of the use or inability to use the materials on Forthix, even if Forthix or an authorized
                            representative has been notified orally or in writing of the possibility of such damage.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">5. Revisions</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            The materials appearing on Forthix could include technical, typographical, or photographic
                            errors. Forthix does not warrant that any of the materials on its website are accurate,
                            complete or current. Forthix may make changes to the materials contained on its website at
                            any time without notice.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">6. Contact Information</h2>
                        <p className="text-gray-400 leading-relaxed">
                            If you have any questions about these Terms of Service, please contact us through our
                            support page.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
