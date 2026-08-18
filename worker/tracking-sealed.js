// Somente metadados criptográficos e conteúdo cifrado são versionados.
// A senha e os dados legíveis do acompanhamento não pertencem ao repositório.
export const sealedTrackingConfig = Object.freeze({
  version: 1,
  kdf: "HKDF-SHA256",
  cipher: "AES-256-GCM",
  context: "destino-espanha:tracking:3903444641a3371ce99f2b56:v1",
  salt: "sm7_nuHe1hQPXj8IFf5a6Q",
  iv: "3AEdMTdu8VvoLLlN",
  ciphertext: "a2Cq-PAHHMe2BUGZpJw1zwceuEt_n83FBKCjrZWVBzhYeGsvLO9hqn87t6dmu0gH3URMx7x-6q7iFVFIqdHiKBK3CGYLk3pKQ1qyssM3eccdWVkrDpWzCF3Emn_JWuGfgkSjROYOvFVC5ySUj3N2n7TVVysmmVreduT5ikeWnh2bmT2VUKVXR2rj54K3dYwuq084KRHqx9MgsUTgTK71CksnFVk4eKW6Hr7CCLP1LHbN30Heabk6QntfJQCbf3UkAE3O_-kyY9krNH0_B59Cgf09hKqYUG9pn8w02FGIaRAECqr63GgEA0X8_n-JCXJAuSYOnPNfIm8PiCkegvLH14FSr5aOdIQoz136ctVmC3G0UzT5Vrn-aFKngKtquh0QwzRInoXLmZJHg09PzWS-owqYLaNv-fDPzHyLXtcHnOJh5zPZjOBavycMn-TWYQw38RolG84yn217wQINcbnnQAxJZ8GtoTFNRLcLgniZtB8rUITl9_VzYWAgqaF5_D_3l6jM0OmuImoHIq-i",
});
