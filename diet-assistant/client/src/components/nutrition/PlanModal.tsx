/* eslint-disable @typescript-eslint/no-explicit-any */
// PlanModal.tsx (o arriba del mismo archivo, fuera de NutritionChat)
import React from "react";
import { motion } from "framer-motion";

type PlanModalProps = {
  open: boolean;
  onClose: () => void;
  plan: any;
  onCopy?: () => void;
};

const PlanModal: React.FC<PlanModalProps> = React.memo(
  ({ open, onClose, plan, onCopy }) => {
    if (!open || !plan) return null;

    const calories = plan?.calories_per_day;
    const macros = plan?.macros || {};
    const guidelines = plan?.guidelines || [];
    const days = plan?.meal_plan_7d || [];
    const shopping = plan?.shopping_list || [];
    const prep = plan?.prep_plan || [];
    const adjustments = plan?.adjustments || [];
    const disclaimers = plan?.disclaimers || [];

    return (
      <div className="modal">
        <div className="modal__overlay" onClick={onClose} />
        <motion.div
          className="modal__card"
          initial={false} // ⬅️ importante: no re-animar en cada re-render
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="modal__header">
            <h3>Personalized Nutrition Plan</h3>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={onCopy} type="button">
                Copy JSON
              </button>
              <button className="btn" onClick={onClose} type="button">
                Close
              </button>
            </div>
          </div>

          <div className="modal__section">
            {calories && (
              <div className="kpis">
                <div className="kpi">
                  <div className="kpi__label">Calories / day</div>
                  <div className="kpi__value">{calories}</div>
                </div>
                <div className="kpi">
                  <div className="kpi__label">Protein (g)</div>
                  <div className="kpi__value">{macros?.protein_g ?? "-"}</div>
                </div>
                <div className="kpi">
                  <div className="kpi__label">Carbs (g)</div>
                  <div className="kpi__value">{macros?.carbs_g ?? "-"}</div>
                </div>
                <div className="kpi">
                  <div className="kpi__label">Fat (g)</div>
                  <div className="kpi__value">{macros?.fat_g ?? "-"}</div>
                </div>
              </div>
            )}
          </div>

          {Array.isArray(guidelines) && guidelines.length > 0 && (
            <div className="modal__section">
              <h4>Guidelines</h4>
              <ul className="list">
                {guidelines.map((g: string, i: number) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(days) && days.length > 0 && (
            <div className="modal__section">
              <h4>7-Day Meal Plan</h4>
              <div className="days">
                {days.map((day: any, idx: number) => (
                  <div className="day" key={idx}>
                    <div className="day__title">Day {day.day ?? idx + 1}</div>
                    <div className="meals">
                      {(day.meals || []).map((m: any, mi: number) => (
                        <div className="meal" key={mi}>
                          <div className="meal__name">{m.name}</div>
                          <div className="meal__items">
                            {(m.items || []).map((it: any, ii: number) => (
                              <span key={ii} className="chip">
                                {it.food} {it.qty ? `• ${it.qty}` : ""}
                              </span>
                            ))}
                          </div>
                          {m.recipe && (
                            <div className="meal__recipe">
                              <span className="muted">Recipe:</span> {m.recipe}
                              {m.prep_time_min && (
                                <span className="muted">
                                  {" "}
                                  • {m.prep_time_min} min
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(shopping) && shopping.length > 0 && (
            <div className="modal__section">
              <h4>Shopping List</h4>
              <div className="grid grid--2">
                {shopping.map((cat: any, i: number) => (
                  <div className="card" key={i}>
                    <div className="card__title">{cat.category}</div>
                    <ul className="list">
                      {(cat.items || []).map((it: string, j: number) => (
                        <li key={j}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(prep) && prep.length > 0 && (
            <div className="modal__section">
              <h4>Prep Plan</h4>
              <ul className="list">
                {prep.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(adjustments) && adjustments.length > 0 && (
            <div className="modal__section">
              <h4>Adjustments</h4>
              <ul className="list">
                {adjustments.map((a: string, i: number) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(disclaimers) && disclaimers.length > 0 && (
            <div className="modal__section">
              <h4>Notes</h4>
              <ul className="list">
                {disclaimers.map((d: string, i: number) => (
                  <li key={i} className="muted">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    );
  }
);

export default PlanModal;
