// Valor enviado no body da requisição POST da LMS para a rota de launch da learning tool
// Serve para verificar se não houve um cross-site request forgery
export const XSRF_SESSION_KEY = "ltiExpXSRF";

// Valor que vem dentro do token JWT já decodificado
// Serve para verificar a integridade do token
export const NONCE_KEY = "ltiExpNonce";
