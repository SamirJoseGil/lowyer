import { Form } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ConsentModalProps {
  isOpen: boolean;
  onClose?: () => void;
  termsVersion: string;
  privacyVersion: string;
}

export default function ConsentModal({ 
  isOpen, 
  onClose, 
  termsVersion, 
  privacyVersion 
}: ConsentModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const canSubmit = acceptedTerms && acceptedPrivacy;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-blue-100">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                      Actualización de Términos
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Por favor, revisa y acepta las políticas actualizadas
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <Form method="post" className="space-y-6">
                  <input type="hidden" name="action" value="accept-consent" />
                  <input type="hidden" name="termsVersion" value={termsVersion} />
                  <input type="hidden" name="privacyVersion" value={privacyVersion} />

                  {/* Info Box */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-900 leading-relaxed">
                      <strong>Hemos actualizado nuestras políticas.</strong> Para continuar usando Lawyer Platform, 
                      necesitas revisar y aceptar los términos actualizados.
                    </p>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          He leído y acepto los{" "}
                          <a
                            href="/terminos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            Términos de Servicio
                          </a>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Versión {termsVersion}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          He leído y acepto la{" "}
                          <a
                            href="/privacidad"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            Política de Privacidad
                          </a>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Versión {privacyVersion}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Warning */}
                  {!canSubmit && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                      <p className="text-sm text-yellow-900">
                        ⚠️ Debes aceptar ambas políticas para continuar usando la plataforma
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      canSubmit
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {canSubmit ? 'Aceptar y Continuar' : 'Acepta las políticas para continuar'}
                  </button>
                </Form>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  Al aceptar, confirmas que has leído y entendido nuestras políticas actualizadas
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
