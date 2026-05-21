# Homebrew formula for the porthole CLI (standalone binary, no Node required).
#
# Setup (maintainer):
#   1. Tag a release and upload binaries (see README below or .github/workflows/release.yml)
#   2. Fill in the three sha256 values from packages/cli/binaries/checksums.txt
#   3. Commit and push
#
# Install (users):
#   brew tap SaiBhargavRallapalli/porthole https://github.com/SaiBhargavRallapalli/porthole
#   brew install porthole
#
# Or one-shot (no tap; needs a GitHub Release with matching binaries):
#   brew install https://raw.githubusercontent.com/SaiBhargavRallapalli/porthole/main/Formula/porthole.rb
#
# Local file (from repo root; same release + sha256 requirements):
#   brew install ./Formula/porthole.rb

class Porthole < Formula
  desc "Expose your local server to the internet"
  homepage "https://github.com/SaiBhargavRallapalli/porthole"
  license "MIT"
  version "1.0.1"

  BASE = "https://github.com/SaiBhargavRallapalli/porthole/releases/download/v#{version}"

  on_macos do
    on_arm do
      url "#{BASE}/porthole-macos-arm64"
      sha256 "342cd8f7469f0ebb717b80253b243bc4e34ecea7f477f729daf1f72b273c98b9"
    end

    on_intel do
      url "#{BASE}/porthole-macos-x64"
      sha256 "b329a64d4ca681bb61982dd5419c11b8777da9ee84709aafd2cb9c3f815b32c0"
    end
  end

  on_linux do
    on_intel do
      url "#{BASE}/porthole-linux-x64"
      sha256 "efb77086942770961f068f57e8936c54ecd5fafacaa6fc24fabfdc3983a6f6e4"
    end
  end

  def install
    if OS.mac? && Hardware::CPU.arm?
      bin.install "porthole-macos-arm64" => "porthole"
    elsif OS.mac?
      bin.install "porthole-macos-x64" => "porthole"
    else
      bin.install "porthole-linux-x64" => "porthole"
    end
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/porthole --version")
  end
end
