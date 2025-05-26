// Image Modal component
import React from "react";
import { Button } from "react-bootstrap";

const ImageModal = ({ modalImage, setModalImage}) => {
    if (!modalImage) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2000,
                padding: '20px',
                cursor: 'zoom-out'
            }}
            onClick={() => setModalImage(null)}
        >
            <div
                style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={modalImage.url}
                    alt={modalImage.name}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        objectFit: 'contain',
                        borderRadius: '4px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}
                />
                <Button
                    variant="light"
                    size="sm"
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.8)',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    onClick={() => setModalImage(null)}
                >
                    ✕
                </Button>

                {modalImage.name && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            maxWidth: '80%',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {modalImage.name}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageModal;
