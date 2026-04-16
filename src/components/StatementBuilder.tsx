// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: StatementBuilder (Rule Builder UI)
// Interface berbentuk statement builder untuk membuat rules secara dynamic
// Format: JIKA [Kondisi] [Operator] [Nilai] MAKA POIN [+N/-N]
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState } from "react";
import {
  ConditionType,
  ConditionOperator,
  CreateRulePayload,
  TargetRole,
} from "@/types/point";
import { Plus, X } from "lucide-react";

interface StatementBuilderProps {
  value?: {
    condition_type: ConditionType;
    condition_operator: ConditionOperator;
    condition_value: string;
    point_modifier: number;
  };
  onChange?: (data: {
    condition_type: ConditionType;
    condition_operator: ConditionOperator;
    condition_value: string;
    point_modifier: number;
  }) => void;
  isLoading?: boolean;
}

export default function StatementBuilder({
  value,
  onChange,
  isLoading = false,
}: StatementBuilderProps) {
  const [conditionType, setConditionType] = useState<ConditionType>(
    value?.condition_type || "arrival_time",
  );
  const [conditionOperator, setConditionOperator] = useState<ConditionOperator>(
    value?.condition_operator || "<",
  );
  const [conditionValue, setConditionValue] = useState(
    value?.condition_value || "",
  );
  const [pointModifier, setPointModifier] = useState(
    value?.point_modifier || 5,
  );
  const [errors, setErrors] = useState<string[]>([]);

  const conditionTypeLabels: Record<ConditionType, string> = {
    arrival_time: "Jam Kedatangan",
    lateness: "Keterlambatan (menit)",
    absence: "Absensi",
    early_arrival: "Kedatangan Awal",
  };

  const operatorLabels: Record<ConditionOperator, string> = {
    "<": "Kurang dari",
    ">": "Lebih dari",
    "==": "Sama dengan",
    BETWEEN: "Antara",
  };

  const availableOperators: Record<ConditionType, ConditionOperator[]> = {
    arrival_time: ["<", ">"],
    lateness: ["<", ">", "BETWEEN"],
    absence: ["=="],
    early_arrival: ["<"],
  };

  // ✅ FIX: Helper untuk notify parent — dipanggil manual di setiap handler,
  // bukan lewat useEffect, sehingga tidak ada infinite loop.
  const notifyChange = (
    overrides?: Partial<{
      condition_type: ConditionType;
      condition_operator: ConditionOperator;
      condition_value: string;
      point_modifier: number;
    }>,
  ) => {
    onChange?.({
      condition_type: conditionType,
      condition_operator: conditionOperator,
      condition_value: conditionValue,
      point_modifier: pointModifier,
      ...overrides,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!conditionValue.trim()) {
      newErrors.push("Nilai kondisi harus diisi");
    }

    if (conditionOperator === "BETWEEN") {
      if (!conditionValue.includes(",")) {
        newErrors.push("Format BETWEEN: nilai1,nilai2 (pisahkan dengan koma)");
      }
    }

    if (pointModifier === 0) {
      newErrors.push("Modifier poin tidak boleh 0");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // ✅ FIX: Sync state dari props menggunakan JSON.stringify agar object baru
  // dari parent tidak terus men-trigger useEffect di setiap render.
  React.useEffect(() => {
    if (value) {
      setConditionType(value.condition_type);
      setConditionOperator(value.condition_operator);
      setConditionValue(value.condition_value);
      setPointModifier(value.point_modifier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  // ✅ FIX: useEffect "notify parent" DIHAPUS — diganti notifyChange() manual.
  // ✅ FIX: useEffect "reset operator" DIHAPUS — logicnya dipindah ke handler
  //         conditionType di bawah agar tidak trigger loop.

  return (
    <div className="space-y-4">
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm font-semibold text-red-800 mb-2">
            Validasi gagal:
          </p>
          <ul className="space-y-1">
            {errors.map((error, idx) => (
              <li
                key={idx}
                className="text-sm text-red-700 flex items-start gap-2"
              >
                <span>•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visual Statement Builder */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-800 mb-4">📋 Kondisi Rule</h3>

        {/* Visual Statement */}
        <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300 space-y-3">
          {/* IF Statement */}
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
              JIKA
            </span>

            {/* ✅ FIX: Condition Type handler — reset operator jika tidak
                tersedia untuk tipe baru, lalu notify parent sekaligus. */}
            <select
              value={conditionType}
              onChange={(e) => {
                const newType = e.target.value as ConditionType;
                const availableOps = availableOperators[newType];
                const newOp = availableOps.includes(conditionOperator)
                  ? conditionOperator
                  : availableOps[0];

                setConditionType(newType);
                setConditionOperator(newOp);
                notifyChange({
                  condition_type: newType,
                  condition_operator: newOp,
                });
              }}
              disabled={isLoading}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:border-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            >
              {Object.entries(conditionTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* ✅ FIX: Operator handler — notify parent langsung */}
            <select
              value={conditionOperator}
              onChange={(e) => {
                const newOp = e.target.value as ConditionOperator;
                setConditionOperator(newOp);
                notifyChange({ condition_operator: newOp });
              }}
              disabled={isLoading}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:border-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            >
              {availableOperators[conditionType].map((op) => (
                <option key={op} value={op}>
                  {operatorLabels[op]}
                </option>
              ))}
            </select>

            {/* ✅ FIX: Value handler — notify parent langsung */}
            <input
              type="text"
              value={conditionValue}
              onChange={(e) => {
                setConditionValue(e.target.value);
                notifyChange({ condition_value: e.target.value });
              }}
              onBlur={validateForm}
              placeholder={
                conditionOperator === "BETWEEN" ? "nilai1,nilai2" : "nilai"
              }
              disabled={isLoading}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-semibold focus:border-blue-500 focus:outline-none w-32 disabled:opacity-50"
            />
          </div>

          {/* THEN Statement */}
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs">
              MAKA POIN
            </span>

            {/* Point Modifier */}
            <div className="flex items-center gap-1">
              {/* ✅ FIX: Tombol − notify parent langsung */}
              <button
                type="button"
                onClick={() => {
                  const val = Math.max(-50, pointModifier - 1);
                  setPointModifier(val);
                  notifyChange({ point_modifier: val });
                }}
                disabled={isLoading}
                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>

              {/* ✅ FIX: Input number notify parent langsung */}
              <input
                type="number"
                value={pointModifier}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setPointModifier(val);
                  notifyChange({ point_modifier: val });
                }}
                disabled={isLoading}
                className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-sm font-bold text-center focus:border-green-500 focus:outline-none disabled:opacity-50"
              />

              {/* ✅ FIX: Tombol + notify parent langsung */}
              <button
                type="button"
                onClick={() => {
                  const val = Math.min(50, pointModifier + 1);
                  setPointModifier(val);
                  notifyChange({ point_modifier: val });
                }}
                disabled={isLoading}
                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>

            {/* Point Display */}
            <span
              className={`font-bold text-lg ${
                pointModifier > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {pointModifier > 0 ? "+" : ""}
              {pointModifier}
            </span>
          </div>
        </div>

        {/* Operator Helper Text */}
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-slate-600">
            <span className="font-semibold">Contoh format:</span>
            {conditionOperator === "BETWEEN" ? (
              <span className="ml-2">
                "06:30,07:00" (Antara jam 06:30 dan 07:00)
              </span>
            ) : (
              <span className="ml-2">
                {conditionType === "arrival_time"
                  ? '"06:30" (Jam dalam format HH:MM)'
                  : '"15" (Nilai dalam menit atau angka)'}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
