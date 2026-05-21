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
# Or one-shot (no tap):
#   brew install --formula https://raw.githubusercontent.com/SaiBhargavRallapalli/porthole/main/Formula/porthole.rb

class Porthole < Formula
  desc "Expose your local server to the internet"
  homepage "https://github.com/SaiBhargavRallapalli/porthole"
  license "MIT"
  version "1.0.1"

  BASE = "https://github.com/SaiBhargavRallapalli/porthole/releases/download/v#{version}"

  on_macos do
    on_arm do
      url "#{BASE}/porthole-macos-arm64"
      sha256 "REPLACE_WITH_SHA256_ARM64"
    end

    on_intel do
      url "#{BASE}/porthole-macos-x64"
      sha256 "REPLACE_WITH_SHA256_X64"
    end
  end

  on_linux do
    on_intel do
      url "#{BASE}/porthole-linux-x64"
      sha256 "REPLACE_WITH_SHA256_LINUX_X64"
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
