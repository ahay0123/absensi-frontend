"use client";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
    type: AlertType;
    message: string;
    duration?: number; // Auto-dismiss duration in ms (default: 5000)
    onClose?: () => void;
}

const alertConfig = {
    success: {
        icon: CheckCircle,
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        textColor: "text-emerald-800",
        iconColor: "text-emerald-600",
    },
    error: {
        icon: XCircle,
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        iconColor: "text-red-600",
    },
    warning: {
        icon: AlertCircle,
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        textColor: "text-amber-800",
        iconColor: "text-amber-600",
    },
    info: {
        icon: Info,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-800",
        iconColor: "text-blue-600",
    },
};

export default function Alert({
    type,
    message,
    duration = 5000,
    onClose,
}: AlertProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    const config = alertConfig[type];
    const Icon = config.icon;

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300); // Match animation duration
    };

    if (!isVisible) return null;

    return (
        <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md transition-all duration-300 ${isExiting
                    ? "opacity-0 -translate-y-4"
                    : "opacity-100 translate-y-0 animate-slideDown"
                }`}
        >
            <div
                className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-4 shadow-xl flex items-start gap-3`}
            >
                <Icon className={`${config.iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
                <p className={`${config.textColor} font-medium text-sm flex-1 leading-relaxed`}>
                    {message}
                </p>
                <button
                    onClick={handleClose}
                    className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// Custom hook for managing alert state
export function useAlert() {
    const [alert, setAlert] = useState<{
        type: AlertType;
        message: string;
    } | null>(null);

    const showAlert = (type: AlertType, message: string) => {
        setAlert({ type, message });
    };

    const hideAlert = () => {
        setAlert(null);
    };

    return { alert, showAlert, hideAlert };
}
