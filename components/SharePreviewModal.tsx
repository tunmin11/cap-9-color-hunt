import { useEffect, useState } from "react";

interface SharePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageBlob: Blob | null;
    packColorName: string;
}

export default function SharePreviewModal({ isOpen, onClose, imageBlob, packColorName }: SharePreviewModalProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (imageBlob) {
            const url = URL.createObjectURL(imageBlob);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [imageBlob]);

    if (!isOpen || !imageBlob) return null;

    const handleShare = async () => {
        if (!imageBlob) return;

        const file = new File([imageBlob], `colour-hunt-${packColorName}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'My Colour Hunt',
                    text: `I found all 9 ${packColorName} items! #colourhunt`,
                });
                onClose();
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            // Fallback: Download
            const a = document.createElement('a');
            a.href = imageUrl!;
            a.download = `colour-hunt-${packColorName}.png`;
            a.click();
            alert("Image downloaded! You can now post it to Instagram.");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#E0DBD8] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-[#A41F13]/10 flex justify-between items-center bg-white">
                    <h3 className="font-black text-[#A41F13] text-lg">Share Preview</h3>
                    <button onClick={onClose} className="text-[#A41F13]/60 hover:text-[#A41F13]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-[#E0DBD8]">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Share Preview"
                            className="w-full h-auto rounded-xl shadow-lg border-4 border-white"
                        />
                    )}
                    <p className="text-[#A41F13]/60 text-sm mt-4 text-center font-medium">
                        Ready to share to your story!
                    </p>
                </div>

                <div className="p-4 border-t border-[#A41F13]/10 bg-white">
                    <button
                        onClick={handleShare}
                        className="w-full bg-[#A41F13] text-[#E0DBD8] py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        Share Now
                    </button>
                </div>
            </div>
        </div>
    );
}
