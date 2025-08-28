import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Save, Send, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QUESTIONS, ROLES, ASSESSMENT_TYPES, createAssessment } from '../lib/data';
import { saveAssessment, saveDraft, getDraft, clearDraft } from '../lib/storage';

const Assessment = ({ onComplete }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    meta: {
      assesseeName: '',
      role: '',
      squad: '',
      tribe: '',
      assessmentType: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    },
    responses: {}
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Load draft on component mount
  useEffect(() => {
    const draft = getDraft();
    if (draft) {
      setFormData(draft);
    }
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(formData.responses).length > 0 || formData.meta.assesseeName) {
        saveDraft(formData);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const handleMetaChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleResponseChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: parseInt(value)
      }
    }));

    // Clear error when user selects an answer
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate metadata
    if (!formData.meta.assesseeName.trim()) {
      newErrors.assesseeName = 'Name is required';
    }
    if (!formData.meta.role) {
      newErrors.role = 'Role is required';
    }
    if (!formData.meta.squad.trim()) {
      newErrors.squad = 'Squad is required';
    }
    if (!formData.meta.tribe.trim()) {
      newErrors.tribe = 'Tribe is required';
    }
    if (!formData.meta.assessmentType) {
      newErrors.assessmentType = 'Assessment type is required';
    }

    // Validate all questions are answered
    QUESTIONS.forEach(question => {
      if (!formData.responses[question.id]) {
        newErrors[question.id] = 'This question is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    saveDraft(formData);
    // Show success message (could add toast notification here)
    alert('Draft saved successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const assessment = createAssessment(formData.meta, formData.responses);
      const success = saveAssessment(assessment);
      
      if (success) {
        clearDraft();
        onComplete(assessment);
        navigate('/results');
      } else {
        alert('Error saving assessment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = () => {
    const totalFields = 6; // meta fields
    const totalQuestions = QUESTIONS.length;
    const completedFields = Object.values(formData.meta).filter(v => v && v.toString().trim()).length - 1; // exclude notes
    const completedQuestions = Object.keys(formData.responses).length;
    
    return ((completedFields + completedQuestions) / (totalFields + totalQuestions)) * 100;
  };

  const getLikertLabel = (value) => {
    const labels = {
      1: 'Strongly Disagree',
      2: 'Disagree', 
      3: 'Neutral',
      4: 'Agree',
      5: 'Strongly Agree'
    };
    return labels[value] || '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Tribe Assessment Survey
            <div className="text-sm font-normal text-muted-foreground">
              Progress: {Math.round(getProgress())}%
            </div>
          </CardTitle>
          <CardDescription>
            Complete this assessment to evaluate competencies across 7 SFIA-aligned domains.
            Your responses will be used to generate personalized recommendations.
          </CardDescription>
          <Progress value={getProgress()} className="w-full" />
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Metadata Section */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Information</CardTitle>
            <CardDescription>
              Please provide the following details about the person being assessed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assesseeName">Assessee Name *</Label>
                <Input
                  id="assesseeName"
                  value={formData.meta.assesseeName}
                  onChange={(e) => handleMetaChange('assesseeName', e.target.value)}
                  placeholder="Enter full name"
                  className={errors.assesseeName ? 'border-destructive' : ''}
                />
                {errors.assesseeName && (
                  <p className="text-sm text-destructive">{errors.assesseeName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.meta.role} onValueChange={(value) => handleMetaChange('role', value)}>
                  <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="squad">Squad *</Label>
                <Input
                  id="squad"
                  value={formData.meta.squad}
                  onChange={(e) => handleMetaChange('squad', e.target.value)}
                  placeholder="e.g., Squad Alpha"
                  className={errors.squad ? 'border-destructive' : ''}
                />
                {errors.squad && (
                  <p className="text-sm text-destructive">{errors.squad}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tribe">Tribe *</Label>
                <Input
                  id="tribe"
                  value={formData.meta.tribe}
                  onChange={(e) => handleMetaChange('tribe', e.target.value)}
                  placeholder="e.g., Digital Banking"
                  className={errors.tribe ? 'border-destructive' : ''}
                />
                {errors.tribe && (
                  <p className="text-sm text-destructive">{errors.tribe}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessmentType">Assessment Type *</Label>
                <Select value={formData.meta.assessmentType} onValueChange={(value) => handleMetaChange('assessmentType', value)}>
                  <SelectTrigger className={errors.assessmentType ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select assessment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSESSMENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assessmentType && (
                  <p className="text-sm text-destructive">{errors.assessmentType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Assessment Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.meta.date}
                  onChange={(e) => handleMetaChange('date', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.meta.notes}
                onChange={(e) => handleMetaChange('notes', e.target.value)}
                placeholder="Any additional context or notes about this assessment..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Questions</CardTitle>
            <CardDescription>
              Rate each statement on a scale of 1-5 based on how well it describes the individual.
              Hover over the help icon for examples of what good performance looks like.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <TooltipProvider>
              {QUESTIONS.map((question, index) => (
                <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Q{index + 1}
                        </span>
                        <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                          {question.competency}
                        </span>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>{question.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm leading-relaxed">{question.text}</p>
                    </div>
                  </div>

                  <RadioGroup
                    value={formData.responses[question.id]?.toString() || ''}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                    className="flex items-center space-x-6"
                  >
                    {[1, 2, 3, 4, 5].map(value => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                        <Label 
                          htmlFor={`${question.id}-${value}`}
                          className="text-sm cursor-pointer"
                        >
                          {value}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>

                  {formData.responses[question.id] && (
                    <p className="text-sm text-primary font-medium">
                      Selected: {getLikertLabel(formData.responses[question.id])}
                    </p>
                  )}

                  {showValidation && errors[question.id] && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors[question.id]}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Assessment'}</span>
              </Button>
            </div>

            {showValidation && Object.keys(errors).length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please complete all required fields before submitting.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Assessment;

