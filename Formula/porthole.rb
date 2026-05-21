# To use this formula, create a tap:
#   brew tap SaiBhargavRallapalli/porthole https://github.com/SaiBhargavRallapalli/porthole
#   brew install porthole
#
# Or install directly:
#   brew install --formula https://raw.githubusercontent.com/SaiBhargavRallapalli/porthole/main/Formula/porthole.rb
#
# After a release, update version + sha256 values and run:
#   brew audit --new-formula Formula/porthole.rb

class Porthole < Formula
  desc "Expose your local server to the internet"
  homepage "https://github.com/SaiBhargavRallapalli/porthole"
  license "MIT"
  version "1.0.0"

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
    binary = Dir["porthole-*"].first
    raise "No binary found" unless binary

    bin.install binary => "porthole"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/porthole --version")
  end
end
