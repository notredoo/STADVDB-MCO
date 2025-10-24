'use client';

export default function ReportCard({ title, children, isLoading = false }: { title: string; children: React.ReactNode; isLoading?: boolean }) {
    return (
        <div className="bg-white shadow-lg rounded-lg p-4 pb-6 border border-gray-400">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading data...</p>
                </div>
            ) : (
                children
            )}
        </div>
    );
}

