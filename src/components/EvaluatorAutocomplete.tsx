import React, { useState, useEffect, useRef } from 'react';
import { EvaluatorProfile } from '../services/evaluatorService';

interface EvaluatorAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelectEvaluator: (evaluator: EvaluatorProfile) => void;
    evaluators: EvaluatorProfile[];
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export const EvaluatorAutocomplete: React.FC<EvaluatorAutocompleteProps> = ({
    value,
    onChange,
    onSelectEvaluator,
    evaluators,
    placeholder = 'Type to search evaluators...',
    className = '',
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredEvaluators, setFilteredEvaluators] = useState<EvaluatorProfile[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value.length >= 2) {
            const filtered = evaluators.filter(
                (evaluator) =>
                    evaluator.name.toLowerCase().includes(value.toLowerCase()) ||
                    evaluator.depedEmail.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredEvaluators(filtered);
            setIsOpen(filtered.length > 0);
        } else {
            setFilteredEvaluators([]);
            setIsOpen(false);
        }
    }, [value, evaluators]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (evaluator: EvaluatorProfile) => {
        onChange(evaluator.name);
        onSelectEvaluator(evaluator);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => {
                    if (filteredEvaluators.length > 0) {
                        setIsOpen(true);
                    }
                }}
                placeholder={placeholder}
                className={className}
                required={required}
                autoComplete="off"
            />

            {isOpen && filteredEvaluators.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredEvaluators.map((evaluator) => (
                        <button
                            key={evaluator._id}
                            type="button"
                            onClick={() => handleSelect(evaluator)}
                            className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                            <div className="font-medium text-gray-900">{evaluator.name}</div>
                            <div className="text-sm text-gray-500 mt-0.5">
                                {evaluator.designation} | {evaluator.regionDivision}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{evaluator.depedEmail}</div>
                        </button>
                    ))}
                </div>
            )}

            {value.length >= 2 && filteredEvaluators.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                    <p className="text-sm text-gray-500 text-center">
                        No evaluators found. You can still enter the name manually.
                    </p>
                </div>
            )}
        </div>
    );
};
