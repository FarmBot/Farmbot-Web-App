# A record of installation of a Farmware.
# Useful for restoring a device after a re-flash.
class FarmwareInstallation < ApplicationRecord
  belongs_to :device
  validates  :url, url: true
  validates_uniqueness_of :url, { scope: :device }
  validates_presence_of :device
  # Prevent malice when fetching a farmware manifest
  MAX_JSON_SIZE   = 5000
  OTHER_PROBLEM   = "Unknown error: %s"
  # Keep a dictionary of known errors if fetching
  # the `package` attr raises a runtime error.
  KNOWN_PROBLEMS  = {
    KeyError           =>
      "Farmware manifest must have a `package` field that is a string.",
    OpenURI::HTTPError =>
      "The server is online, but the URL could not be opened.",
    SocketError        =>
      "The server at the provided appears to be offline.",
    JSON::ParserError  =>
      "Expected Farmware manifest to be valid JSON, "\
      "but it is not. Consider using a JSON validator.",
    ActiveRecord::ValueTooLong =>
      "The name of the package is too long.",
    Errno::ECONNREFUSED =>
      "Could not connect to the server at the provided URL."
  }

  # Downloads the farmware manifest JSON file in a background
  # worker, updating the `package` column if possible.
  def force_package_refresh!
    self.delay.infer_package_name_from_url
  end

  # A lot of things can go wrong when fetching
  # a package name in a background worker.
  def maybe_recover_from_fetch_error(error)
    known_error = KNOWN_PROBLEMS[error.class]
    description = \
       known_error || (OTHER_PROBLEM % error.class)
    update_attributes!(package_error: description,
                       package:       nil)
    unless known_error.present?
      raise error
    end
  end

  # SLOW I/O BOUND STUFF! Don't run this on the
  # main thread!
  def infer_package_name_from_url
    string_io = open(url)
    string    = string_io.read(MAX_JSON_SIZE)
    json      = JSON.parse(string)
    pkg_name  = json.fetch("package")
    update_attributes!(package: pkg_name, package_error: nil)
  rescue => error
    maybe_recover_from_fetch_error(error)
  end
end
