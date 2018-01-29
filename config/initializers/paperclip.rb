puts "IS THIS THING ON?"
[
  # Paperclip::AttachmentAdapter,
  # Paperclip::DataUriAdapter,
  # Paperclip::EmptyStringAdapter,
  # Paperclip::IdentityAdapter,
  # Paperclip::NilAdapter,
  # Paperclip::HttpUrlProxyAdapter,
  # Paperclip::UploadedFileAdapter,
  # Paperclip::UriAdapter,
  # Paperclip::FileAdapter,
  Paperclip::StringioAdapter,
].map do |klass|
  Paperclip.io_adapters.register(klass)
end