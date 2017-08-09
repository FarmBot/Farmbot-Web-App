export interface FrontPageState {
  regName?: string;
  regEmail?: string;
  regPassword?: string;
  regConfirmation?: string;
  email?: string;
  loginPassword?: string;
  showServerOpts?: boolean;
  serverURL?: string;
  serverPort?: string;
  forgotPassword?: boolean;
  forgotPasswordEmail?: string;
  agreeToTerms: boolean;
}
