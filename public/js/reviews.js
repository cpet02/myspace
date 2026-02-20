// reviews.js - Review selection functionality

document.addEventListener('DOMContentLoaded', function() {
  // Get all select review buttons
  const selectButtons = document.querySelectorAll('.select-review-btn');
  
  // Create a back button container if it doesn't exist
  let backButtonContainer = document.querySelector('.back-to-featured-container');
  if (!backButtonContainer) {
    backButtonContainer = document.createElement('div');
    backButtonContainer.className = 'back-to-featured-container';
    backButtonContainer.style.display = 'none';
    backButtonContainer.style.marginBottom = '2rem';
    backButtonContainer.style.textAlign = 'center';
    
    const backButton = document.createElement('button');
    backButton.className = 'back-to-featured-btn';
    backButton.textContent = '← Back to Featured Review';
    backButton.style.padding = '0.75rem 1.5rem';
    backButton.style.background = 'var(--color-accent)';
    backButton.style.color = 'white';
    backButton.style.border = 'none';
    backButton.style.borderRadius = 'var(--radius-sm)';
    backButton.style.fontFamily = 'var(--font-accent)';
    backButton.style.fontWeight = '600';
    backButton.style.cursor = 'pointer';
    backButton.style.transition = 'all 0.2s ease';
    
    backButton.addEventListener('mouseenter', function() {
      this.style.background = 'var(--color-accent-light)';
      this.style.transform = 'translateY(-2px)';
    });
    
    backButton.addEventListener('mouseleave', function() {
      this.style.background = 'var(--color-accent)';
      this.style.transform = 'translateY(0)';
    });
    
    backButton.addEventListener('click', function() {
      resetToFeaturedReview();
    });
    
    backButtonContainer.appendChild(backButton);
    
    // Insert after the featured review section
    const featuredSection = document.querySelector('.featured-review');
    if (featuredSection) {
      featuredSection.parentNode.insertBefore(backButtonContainer, featuredSection.nextSibling);
    }
  }
  
  // Add click event to each select button
  selectButtons.forEach(button => {
    button.addEventListener('click', function() {
      const reviewId = this.getAttribute('data-review-id');
      selectReview(reviewId);
    });
  });
  
  function selectReview(reviewId) {
    // Create background overlay
    const overlay = document.createElement('div');
    overlay.className = 'review-selected-overlay';
    document.body.appendChild(overlay);
    
    // Hide the featured review section
    const featuredSection = document.querySelector('.featured-review');
    if (featuredSection) {
      featuredSection.style.display = 'none';
    }
    
    // Hide the external back button container
    if (backButtonContainer) {
      backButtonContainer.style.display = 'none';
    }
    
    // Find the selected review card in "All Reviews"
    const selectedReviewCard = document.querySelector(`.review-card[data-review-id="${reviewId}"]`);
    if (selectedReviewCard) {
      // Clone the card to preserve the original
      const clonedCard = selectedReviewCard.cloneNode(true);
      
      // Remove the select button from the cloned card
      const selectBtn = clonedCard.querySelector('.select-review-btn');
      if (selectBtn) {
        selectBtn.remove();
      }
      
      // Create a new featured review container
      const newFeaturedContainer = document.createElement('div');
      newFeaturedContainer.className = 'selected-review-container';
      newFeaturedContainer.style.marginBottom = 'var(--space-lg)';
      
      // Create a title for the selected review
      const selectedTitle = document.createElement('h2');
      selectedTitle.className = 'section-title';
      selectedTitle.textContent = 'Selected Review';
      selectedTitle.style.fontSize = '2.75rem'; // 5% larger than featured
      selectedTitle.style.marginBottom = 'var(--space-md)';
      
      // Style the cloned card as a featured review
      clonedCard.className = 'review-card featured selected';
      clonedCard.style.transform = 'scale(1.05)'; // 5% larger
      clonedCard.style.transition = 'transform 0.3s ease';
      
      // Add image if it's a movie or music review
      const reviewTitle = clonedCard.querySelector('.review-title').textContent;
      const reviewMeta = clonedCard.querySelector('.review-meta');
      
      // Create image container based on review type
      const isMusicReview = reviewMeta.querySelector('.artist');
      const isMovieReview = reviewMeta.querySelector('.director');
      
      const imageContainer = document.createElement('div');
      imageContainer.className = 'review-image';
      imageContainer.style.minHeight = '294px'; // 5% larger than 280px
      imageContainer.style.width = '294px'; // 5% larger than 280px
      
      if (isMusicReview) {
        // Music review - add album art
        const img = document.createElement('img');
        img.src = `/images/music/${reviewId}.jpg`;
        img.alt = `${reviewTitle} album cover`;
        img.className = 'review-img';
        img.style.objectFit = 'contain';
        imageContainer.appendChild(img);
      } else if (isMovieReview) {
        // Movie review - add movie poster
        const img = document.createElement('img');
        img.src = `/images/movies/${reviewId}.jpg`;
        img.alt = `${reviewTitle} movie poster`;
        img.className = 'review-img';
        img.style.objectFit = 'contain';
        imageContainer.appendChild(img);
      }
      
      // Get or create .review-content wrapper
      let reviewContent = clonedCard.querySelector('.review-content');
      
      if (!reviewContent) {
        // Create the wrapper
        reviewContent = document.createElement('div');
        reviewContent.className = 'review-content';
        
        // Get all the content that should be in the wrapper
        const title = clonedCard.querySelector('.review-title');
        const meta = clonedCard.querySelector('.review-meta');
        const excerpt = clonedCard.querySelector('.review-excerpt');
        
        // Remove them from the card and add to wrapper
        if (title) {
          clonedCard.removeChild(title);
          reviewContent.appendChild(title);
        }
        if (meta) {
          clonedCard.removeChild(meta);
          reviewContent.appendChild(meta);
        }
        if (excerpt) {
          clonedCard.removeChild(excerpt);
          reviewContent.appendChild(excerpt);
        }
        
        // Add the wrapper to the card
        clonedCard.appendChild(reviewContent);
      }
      
      // Insert image before the content
      clonedCard.insertBefore(imageContainer, reviewContent);
      
      // Update grid template columns for selected review (5% larger)
      clonedCard.style.gridTemplateColumns = '294px 1fr'; // 5% larger than 280px
      
      // Ensure proper padding for selected review content
      reviewContent.style.padding = '3.5rem';
      
      // Create back button for inside the selected review
      const insideBackButton = document.createElement('button');
      insideBackButton.className = 'back-to-featured-btn inside-card';
      insideBackButton.textContent = '← Back to Featured Review';
      insideBackButton.style.marginTop = 'var(--space-md)';
      insideBackButton.style.padding = '0.75rem 1.5rem';
      insideBackButton.style.background = 'var(--color-accent)';
      insideBackButton.style.color = 'var(--color-bg-alt)';
      insideBackButton.style.border = '1px solid var(--color-accent-secondary)';
      insideBackButton.style.borderRadius = 'var(--radius-sm)';
      insideBackButton.style.fontFamily = 'var(--font-accent)';
      insideBackButton.style.fontWeight = '600';
      insideBackButton.style.cursor = 'pointer';
      insideBackButton.style.transition = 'all 0.2s ease';
      
      insideBackButton.addEventListener('mouseenter', function() {
        this.style.background = 'var(--color-accent-light)';
        this.style.transform = 'translateY(-2px)';
      });
      
      insideBackButton.addEventListener('mouseleave', function() {
        this.style.background = 'var(--color-accent)';
        this.style.transform = 'translateY(0)';
      });
      
      insideBackButton.addEventListener('click', function() {
        resetToFeaturedReview();
      });
      
      // Add back button to review content
      reviewContent.appendChild(insideBackButton);
      
      // Add to container
      newFeaturedContainer.appendChild(selectedTitle);
      newFeaturedContainer.appendChild(clonedCard);
      
      // Insert after the featured review section (no separate back button container)
      const featuredSection = document.querySelector('.featured-review');
      if (featuredSection) {
        featuredSection.parentNode.insertBefore(newFeaturedContainer, featuredSection.nextSibling);
      }
      
      // Scroll to the selected review for better mobile experience
      setTimeout(() => {
        newFeaturedContainer.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }
  
  function resetToFeaturedReview() {
    // Remove background overlay
    const overlay = document.querySelector('.review-selected-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // Show the featured review section
    const featuredSection = document.querySelector('.featured-review');
    if (featuredSection) {
      featuredSection.style.display = 'block';
    }
    
    // Show the external back button container (for future use)
    if (backButtonContainer) {
      backButtonContainer.style.display = 'none';
    }
    
    // Remove the selected review container
    const selectedContainer = document.querySelector('.selected-review-container');
    if (selectedContainer) {
      selectedContainer.remove();
    }
    
    // Scroll back to the top of the featured review section
    setTimeout(() => {
      if (featuredSection) {
        featuredSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  }
});